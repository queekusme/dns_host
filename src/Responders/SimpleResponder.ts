import * as winston from "winston";

import { Class, DNSProtocolResourceRecord, DNSProtocolResourceRecordAcceptedTypes, Type } from "../Protocol/ProtocolTypes";
import ZoneHandler, { DNSZoneRequest, DNSZoneResponse, ZoneResponder } from "../ZoneHandler";


export interface SimpleResponderDataRecord
{
    authoritativeName: string;
    recordType: Type;
    recordClass: Class;

    records: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[];
    authorities?: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[];
    additionals?: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[];
}

/**
 * Creates a simple responder which matches against
 * the authoritative name, Type and Class only.
 */
export function simpleResponder(records: SimpleResponderDataRecord[]): ZoneResponder
{
    return ZoneHandler.createResponder((logger: winston.Logger | undefined, zone: string, request: DNSZoneRequest, response: DNSZoneResponse) =>
    {
        if (request.zoneQuestion.qClass.value !== Class.IN)
            return;

        const answers: SimpleResponderDataRecord | undefined = records.find((check: SimpleResponderDataRecord) =>
        {
            return check.authoritativeName === request.getAuthoritativeQueryForZone(zone) &&
                check.recordType === request.zoneQuestion.qType.value &&
                check.recordClass === request.zoneQuestion.qClass.value;
        });

        if(answers !== undefined)
        {
            response.addAnswers(...answers.records);

            if(answers.additionals !== undefined)
                response.addAdditionals(...answers.additionals);

            if(answers.authorities !== undefined)
                response.addAuthorities(...answers.authorities);
        }
    });
}
