import * as net from "net";
import Cache from "./Protocol/Cache";

import { DNSProtocolHeader, DNSProtocolQuestion, DNSProtocolResourceRecord, DNSProtocol } from "./Protocol/ProtocolTypes";
import { getAuthoritativePartFromQuestionName } from "./Utils";

export type ZoneResponder = (zone: string, request: DNSZoneRequest, response: DNSZoneResponse) => void;

export class DNSZoneRequest
{
    constructor(
        public readonly zoneName: string,
        public readonly incomingHeader: Readonly<DNSProtocolHeader>,
        public readonly zoneQuestion: Readonly<DNSProtocolQuestion>
    ) { }

    public getAuthoritativeQueryForZone(currentZone: string): string
    {
        return getAuthoritativePartFromQuestionName(currentZone, this.zoneQuestion.qName.value);
    }
}

export class DNSZoneResponse
{
    protected zoneAnswers: DNSProtocolResourceRecord[] = [];
    protected zoneAdditionals: DNSProtocolResourceRecord[] = [];
    protected zoneAuthorities: DNSProtocolResourceRecord[] = [];

    constructor(
        public outgoingHeader: Readonly<DNSProtocolHeader>,
        protected origin: string
    ) { }

    public getAnswers(): DNSProtocolResourceRecord[]
    {
        return this.zoneAnswers;
    }

    public addAnswers(...answers: DNSProtocolResourceRecord[]): void
    {
        for(const answer of answers)
            answer.name.value = answer.name.value.replace(/@/g, this.origin);

        this.zoneAnswers.push(...answers);
    }

    public getAdditionals(): DNSProtocolResourceRecord[]
    {
        return this.zoneAdditionals;
    }

    public addAdditionals(...additionals: DNSProtocolResourceRecord[]): void
    {
        for(const additional of additionals)
            additional.name.value = additional.name.value.replace(/@/g, this.origin);

        this.zoneAdditionals.push(...additionals);
    }

    public getAuthorities(): DNSProtocolResourceRecord[]
    {
        return this.zoneAuthorities;
    }

    public addAuthorities(...authorities: DNSProtocolResourceRecord[]): void
    {
        for(const authority of authorities)
            authority.name.value = authority.name.value.replace(/@/g, this.origin);

        this.zoneAuthorities.push(...authorities);
    }
}

export interface ZoneQuery
{
    request: DNSZoneRequest;
    response: DNSZoneResponse;
}

export class DNSQuery
{
    constructor(
        public readonly fromRemote: net.AddressInfo,
        public readonly protocolIn: DNSProtocol,
        public readonly protocolOut: DNSProtocol
    ) {}

    public getZoneQueries(): ZoneQuery[]
    {
        const queries: ZoneQuery[] = [];
        for(const question of this.protocolIn.questions)
        {
            const reverseOrderDomain: string = question.qName.getReverse();

            queries.push({
                request: new DNSZoneRequest(reverseOrderDomain, this.protocolIn.header, question),
                response: new DNSZoneResponse(this.protocolOut.header, question.qName.value)
            });
        }

        return queries;
    }
}

export default class ZoneHandler
{
    protected zoneResponders: ZoneResponder[] = [];
    protected authoritativeResponder: ZoneResponder | null = null;

    protected subHandlers: ZoneHandler[] = [];
    protected cache: Cache | undefined = undefined;

    constructor(
        public readonly label: string
    ) { }

    /**
     * Get a handler for a zone, calling an optional callback for each subsequent handler
     *
     * @param fullLabel - the full label to get the handler for
     * @param callback  - optional handler, contains the current handler being iterated through
     * @returns the lowest level zone which matches part of the full label, if no zones can be found this will be the root zone
     */
    public getHandlerForZone(fullLabel: string, callback?: (currentHandler: ZoneHandler) => void): ZoneHandler | null
    {
        if(fullLabel === this.label)
            return this;

        if(callback !== undefined)
            callback(this);

        for(const handler of this.subHandlers)
        {
            if(handler.label === fullLabel)
                return handler;

            const splitLabel: string[] = fullLabel.split(".");
            const removed: string | undefined = splitLabel.shift();

            if(splitLabel.length === 0 && removed === undefined)
                continue;

            const zone: ZoneHandler | null = handler.getHandlerForZone(splitLabel.join("."), callback);

            if(zone !== null)
                return zone;

            if(fullLabel.match(new RegExp(`^\.${handler.label}`)) !== null)
                return handler;
        }

        return null;
    }

    /**
     * Register 1 or more ZoneResponder for all zones contained under this zone,
     * Can be used to implement middleware such as for logging, pre-processing or
     * other actions which need performing ahead of main zone resolution
     */
    public use(...responder: ZoneResponder[]): ZoneHandler
    {
        this.zoneResponders.push(...responder);

        return this;
    }

    public useCache(handler: Cache): ZoneHandler
    {
        this.cache = handler;

        return this;
    }

    /**
     * Set the authoritative ZoneResponder for this zone.
     *
     * Will be called after all previously set middleware
     * responders.
     */
    public authoritative(responder: ZoneResponder): ZoneHandler
    {
        this.authoritativeResponder = responder;

        return this;
    }

    /**
     * Register a Sub Zone to handle requests for divergent zones
     *
     * e.g. (for zone .com.google)
     * - android (as .com.google.android)
     * - youtube (as .com.google.youtube)
     * - abc.efg (as .com.google.abc.efg)
     */
    public subZone(handler: ZoneHandler): ZoneHandler
    {
        this.subHandlers.push(handler);

        return this;
    }

    /**
     * Respond to a query from the current Zone Handler
     *
     * @param query - query to respond to
     */
    public respond(query: DNSQuery): void
    {
        for(const zoneQuery of query.getZoneQueries())
        {
            let accLabel: string = "";

            // Respond with our responders by default
            for(const responder of this.zoneResponders)
                responder(accLabel, zoneQuery.request, zoneQuery.response);

            // TODO: Implement Cache Support
            const answer: DNSProtocolResourceRecord[] = this.cache?.get(zoneQuery.request.zoneQuestion.qName) ?? [];

            const zone: ZoneHandler | null = this.getHandlerForZone(zoneQuery.request.zoneName, (currentZone: ZoneHandler) =>
            {
                accLabel = (accLabel + "." + currentZone.label).replace(/\.+/g, ".");
                // Respond with zone responders
                for(const responder of currentZone.zoneResponders)
                    responder(accLabel, zoneQuery.request, zoneQuery.response);
            });

            if(zone !== null && zone.authoritativeResponder !== null)
                zone.authoritativeResponder(accLabel, zoneQuery.request, zoneQuery.response);

            // Update response to include answers from query
            query.protocolOut.answers.push(...zoneQuery.response.getAnswers());
            query.protocolOut.authorities.push(...zoneQuery.response.getAuthorities());
            query.protocolOut.additionals.push(...zoneQuery.response.getAdditionals());
        }
    }
}
