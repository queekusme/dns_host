# DNS Host

DNS Host is a NodeJS framework which allows for a DNS server to be created
and managed in code rather than as zone files.

Zone files can still be used however by reading and parsing files. Utility
functions to handle this (will be provided but currently NYI)

## Basic Server
To create a basic DNS Server which is authoritative for a domain,

```javascript
const server: DNSServer = new DNSServer();

/**
 * Server is automatically authoritative for the root zone,
 * Add our authoritative handler as a sub zone of root
 */
server.subZone(new ZoneHandler("com.queekus").authoritative((zone: string, request: DNSZoneRequest, response: DNSZoneResponse): void =>
{
    if (request.zoneQuestion.qClass.value !== Class.IN) // Only handle Internet Requests for now
        return;

    switch (request.zoneQuestion.qType.value)
    {
        case Type.A:
        {
            switch (request.getAuthoritativeQueryForZone(zone))
            {
                // Example CNAME
                case "www":
                    response.addAnswers(DNSProtocolResourceRecord.of("www.@", Type.CNAME, Class.IN, 60 * 5, Parser.encode(DomainName, "queekus.com.")));
                /**
                 * In this example we fallthrough into the
                 * default return values so that we return
                 * the CNAME with data relevant to its return value
                 */
                case "":
                    response.addAnswers(DNSProtocolResourceRecord.of("@", Type.A, Class.IN, 60 * 5, Parser.encode(IPv4, "192.168.0.10")));
                    break;
            }
        }
    }
}));

server.listen(() => console.log("DNS Server listening on port 53"));
```