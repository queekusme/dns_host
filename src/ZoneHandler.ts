import * as net from "net";
import DomainName from "./Utils/DomainUtils";
import Cache from "./Protocol/Cache";

import { DNSProtocolHeader, DNSProtocolQuestion, DNSProtocolResourceRecord, DNSProtocol, DNSProtocolResourceRecordAcceptedTypes } from "./Protocol/ProtocolTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZoneTransferData = any;

export type ZoneResponderHandler = (zone: string, request: DNSZoneRequest, response: DNSZoneResponse) => void;
export type ZoneTransferHandler = (data: ZoneTransferData) => void;

export interface ZoneResponder
{
    /**
     * The authoritative handler for this responder
     */
    handler: ZoneResponderHandler;

    /**
     * NYI
     *
     * Handler for updating this responder to consider data recieved from a zone transfer
     */
    applyZoneTransfer?: ZoneTransferHandler;
}

export class DNSZoneRequest
{
    constructor(
        public readonly zoneName: string,
        public readonly incomingHeader: Readonly<DNSProtocolHeader>,
        public readonly zoneQuestion: Readonly<DNSProtocolQuestion>
    ) { }

    public getAuthoritativeQueryForZone(currentZone: string): string
    {
        const questionFullName = this.zoneQuestion.qName.value;

        let zoneName: string = currentZone;
        if(zoneName.length > 0 && zoneName[0] === ".")
            zoneName = new DomainName(zoneName).getReverse();

        const fullParts: string = questionFullName.replace(zoneName, "");

        return questionFullName.replace(zoneName, "").slice(0, fullParts.length - 1);
    }
}

export class DNSZoneResponse
{
    protected zoneAnswers: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[] = [];
    protected zoneAdditionals: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[] = [];
    protected zoneAuthorities: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[] = [];

    constructor(
        public outgoingHeader: Readonly<DNSProtocolHeader>
    ) { }

    public getAnswers(): DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]
    {
        return this.zoneAnswers;
    }

    public addAnswers(...answers: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]): void
    {
        this.zoneAnswers.push(...answers);
    }

    public getAdditionals(): DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]
    {
        return this.zoneAdditionals;
    }

    public addAdditionals(...additionals: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]): void
    {
        this.zoneAdditionals.push(...additionals);
    }

    public getAuthorities(): DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]
    {
        return this.zoneAuthorities;
    }

    public addAuthorities(...authorities: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]): void
    {
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
                response: new DNSZoneResponse(this.protocolOut.header)
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

    public readonly label: string;

    constructor(label: string | DomainName)
    {
        this.label = label instanceof DomainName ? label.value : label;

        if(this.label.charAt(this.label.length -1) === ".")
            this.label = new DomainName(this.label).getReverse().slice(1);

        if(this.label.charAt(0) === ".")
            this.label = this.label.slice(1);
    }

    /**
     * Create a responder for a zone from a handler and optional zone transfer handler
     */
    public static createResponder(handler: ZoneResponderHandler, applyZoneTransfer?: ZoneTransferHandler): ZoneResponder
    {
        return {
            handler,
            applyZoneTransfer
        };
    }

    /**
     * Get a handler for a zone, calling an optional callback for each subsequent handler
     *
     * @param fullLabel - the full label to get the handler for
     * @param callback  - optional handler, contains the current handler being iterated through
     * @returns the lowest level zone which matches part of the full label, if no zones can be found this will be the root zone
     */
    public getHandlerForZone(fullLabel: string, callback?: (currentHandler: ZoneHandler) => void): ZoneHandler | null
    {
        if(callback !== undefined)
            callback(this);

        if(fullLabel === this.label)
            return this;

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
     * This method will be called and provided with zone transfer information
     */
    public updateFromZoneTransfer(/** data: ZoneTransferData */): void
    {
        throw new Error("Method not implemented.");
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
                responder.handler(accLabel, zoneQuery.request, zoneQuery.response);

            // TODO: Implement Cache Support

            const zone: ZoneHandler | null = this.getHandlerForZone(zoneQuery.request.zoneName, (currentZone: ZoneHandler) =>
            {
                accLabel = (accLabel + "." + currentZone.label).replace(/\.+/g, ".");
                // Respond with zone responders
                for(const responder of currentZone.zoneResponders)
                    responder.handler(accLabel, zoneQuery.request, zoneQuery.response);
            });

            if(zone !== null && zone.authoritativeResponder !== null)
                zone.authoritativeResponder.handler(accLabel, zoneQuery.request, zoneQuery.response);

            // Update response to include answers from query
            query.protocolOut.answers.push(...zoneQuery.response.getAnswers());
            query.protocolOut.authorities.push(...zoneQuery.response.getAuthorities());
            query.protocolOut.additionals.push(...zoneQuery.response.getAdditionals());
        }
    }
}
