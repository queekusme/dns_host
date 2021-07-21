import { Logger } from "../Utils/LoggerUtils";
import { Class, Type } from "../Protocol/ProtocolTypes";
import ZoneHandler, { DNSZoneRequest, ZoneResponder } from "../ZoneHandler";

export const simpleLoggingResponder: ZoneResponder = ZoneHandler.createResponder(
    (logger: Logger | undefined, zone: string, request: DNSZoneRequest) =>
        logger?.info(`ZONE{${zone}} - ${request.zoneQuestion.qName.value} ${Class[request.zoneQuestion.qClass.value]} ${Type[request.zoneQuestion.qType.value]}`)
);
