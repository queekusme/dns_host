import { Class, Type } from "../Protocol/ProtocolTypes";
import ZoneHandler, { DNSZoneRequest, ZoneResponder } from "../ZoneHandler";

export const simpleLoggingResponder: ZoneResponder = ZoneHandler.createResponder(
    (zone: string, request: DNSZoneRequest) =>
        console.log(`ZONE{${zone}} - ${request.zoneQuestion.qName.value} ${Class[request.zoneQuestion.qClass.value]} ${Type[request.zoneQuestion.qType.value]}`)
);
