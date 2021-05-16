import DNSServer, { DNSServerOptions } from "DNSServer";
import { Bit, Class, ReturnCode, Opcode, Type, QTypeAdditionals, DNSProtocolHeader, DNSProtocol, DNSProtocolQuestion, DNSProtocolResourceRecord, QR } from "Protocol/ProtocolTypes";
import { UInt4, UInt8, UInt16 } from "UInt";
import { ZoneResponder } from "ZoneHandler";


export {
    DNSServer, DNSServerOptions, ZoneResponder,
    Bit, Class, ReturnCode, Opcode, Type, QTypeAdditionals, DNSProtocolHeader, DNSProtocol, DNSProtocolQuestion, DNSProtocolResourceRecord, QR,
    UInt4, UInt8, UInt16
};
