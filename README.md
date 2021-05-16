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
                {
                    const com_queekus: Buffer = new DomainName("queekus.com.").encode();
                    response.addAnswers(DNSProtocolResourceRecord.of("www.@", new UInt16(Type.CNAME), new UInt16(Class.IN), new UInt16(60 * 5), new UInt16(com_queekus.length), com_queekus));
                }
                /**
                 * In this example we fallthrough into the
                 * default return values so that we return
                 * the CNAME with data relevant to its return value
                 */
                case "":
                {
                    response.addAnswers(DNSProtocolResourceRecord.of("@", new UInt16(Type.A), new UInt16(Class.IN), new UInt16(60 * 5), new UInt16(4), ipV4ToUint8Array("192.168.0.10")));
                    break;
                }
            }
        }
    }
}));

server.listen(() => console.log("DNS Server listening on port 53"));
```