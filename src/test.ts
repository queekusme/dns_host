import { IPv4 } from "./Utils/IPAddressUtils";
import DNSServer from "./DNSServer";
import { Class, Type, DNSProtocolResourceRecord } from "./Protocol/ProtocolTypes";
import DomainName from "./Utils/DomainUtils";
import ZoneHandler, { DNSZoneRequest, DNSZoneResponse } from "./ZoneHandler";

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

// server.subZone(
//     new ZoneHandler("com")
//         .use((zone: string, request: DNSZoneRequest) => console.log(`${zone} - ${request.zoneQuestion.qName.value} ${Class[request.zoneQuestion.qClass.value]} ${Type[request.zoneQuestion.qType.value]}`))
//         .authoritative(com_responder));

server.subZone(
    new ZoneHandler("com.queekus")
        .use((zone: string, request: DNSZoneRequest) => console.log(`ZONE{${zone}} - ${request.zoneQuestion.qName.value} ${Class[request.zoneQuestion.qClass.value]} ${Type[request.zoneQuestion.qType.value]}`))
        .authoritative(com_queekus_responder));

server.listen(() => console.log("DNS Server listening on port 53"));
