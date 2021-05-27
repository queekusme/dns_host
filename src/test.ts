import { IPv4 } from "./Utils/IPAddressUtils";
import DNSServer from "./DNSServer";
import { Class, Type, DNSProtocolResourceRecord, DNSProtocolResourceRecordAcceptedTypes } from "./Protocol/ProtocolTypes";
import DomainName from "./Utils/DomainUtils";
import ZoneHandler, { DNSZoneRequest, DNSZoneResponse } from "./ZoneHandler";
import { simpleResponder } from "./Responders/SimpleResponder";
import { simpleLoggingResponder } from "./Responders/SimpleLoggingResponder";

const server: DNSServer = new DNSServer();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const com_queekus_responder = (zone: string, request: DNSZoneRequest, response: DNSZoneResponse): void =>
{
    if (request.zoneQuestion.qClass.value !== Class.IN)
        return;

    switch (request.zoneQuestion.qType.value)
    {
        case Type.A:
        {
            switch (request.getAuthoritativeQueryForZone(zone))
            {
                case "www":
                {
                    response.addAnswers(
                        DNSProtocolResourceRecord.of("www.@", Type.CNAME, Class.IN, 60 * 5, new DomainName("queekus.com."))
                    );
                }
                // eslint-disable-next-line no-fallthrough
                case "":
                {
                    response.addAnswers(
                        DNSProtocolResourceRecord.of("@", Type.A, Class.IN, 60 * 5, new IPv4("192.30.252.153")),
                        DNSProtocolResourceRecord.of("@", Type.A, Class.IN, 60 * 5, new IPv4("192.30.252.154"))
                    );
                    break;
                }
            }
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const com_responder = (zone: string, request: DNSZoneRequest, response: DNSZoneResponse): void => {
    if (request.zoneQuestion.qClass.value !== Class.IN)
        return;

    switch (true)
    {
        case /[^\.]+\.queekus/.test(request.getAuthoritativeQueryForZone(zone)):
            [
                [new DomainName("ns39.domaincontrol.com."), new IPv4("97.74.109.20")],
                [new DomainName("ns40.domaincontrol.com."), new IPv4("173.201.77.20")]
            ].forEach((nameserver: [DomainName, IPv4]) =>
            {
                response.addAuthorities(DNSProtocolResourceRecord.of("queekus.com.", Type.A, Class.IN, 60 * 5, nameserver[0]));
                response.addAdditionals(DNSProtocolResourceRecord.of(nameserver[0], Type.A, Class.IN, 60 * 5, nameserver[1]));
            });
            break;
        case /[^\.]+\.anotherdomain/.test(request.getAuthoritativeQueryForZone(zone)):
            [
                [new DomainName("ns39.domaincontrol.com."), new IPv4("1.2.3.4")],
                [new DomainName("ns40.domaincontrol.com."), new IPv4("2.3.4.5")]
            ].forEach((nameserver: [DomainName, IPv4]) =>
            {
                response.addAuthorities(DNSProtocolResourceRecord.of("anotherdomain.com.", Type.A, Class.IN, 60 * 5, nameserver[0]));
                response.addAdditionals(DNSProtocolResourceRecord.of(nameserver[0], Type.A, Class.IN, 60 * 5, nameserver[1]));
            });
            break;
    }
};

const queekus_com_name: DomainName = new DomainName("queekus.com.");

// server.subZone(
//     new ZoneHandler("com")
//         .use(simpleLoggingResponder)
//         .authoritative(ZoneHandler.createResponder(com_responder)));

// server.subZone(
//     new ZoneHandler(queekus_com_name)
//         .use(simpleLoggingResponder)
//         .authoritative(ZoneHandler.createResponder(com_queekus_responder)));


const com_queekus_records: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[] = [
    DNSProtocolResourceRecord.of(queekus_com_name, Type.A, Class.IN, 60 * 5, new IPv4("192.30.252.153")),
    DNSProtocolResourceRecord.of(queekus_com_name, Type.A, Class.IN, 60 * 5, new IPv4("192.30.252.154"))
];

server.subZone(
    new ZoneHandler(queekus_com_name)
        .use(simpleLoggingResponder)
        .authoritative(simpleResponder([
            {
                authoritativeName: "",
                recordClass: Class.IN,
                recordType: Type.A,
                records: com_queekus_records
            },
            {
                authoritativeName: "www",
                recordClass: Class.IN,
                recordType: Type.A,
                records: [
                    DNSProtocolResourceRecord.of(queekus_com_name.clone("www"), Type.CNAME, Class.IN, 60 * 5, queekus_com_name),
                    ...com_queekus_records
                ]
            }
        ])));

server.listen(() => console.log("DNS Server listening on port 53"));
