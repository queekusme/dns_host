import * as net from "net";
import * as dgram from "dgram";

import { DNSProtocol, ReturnCode } from "./Protocol/ProtocolTypes";
import ZoneHandler, { DNSQuery } from "./ZoneHandler";

export interface DNSServerOptions
{
    /**
     * TCP Port to start the server on
     */
    tcpPort: number;

    /**
     * UDP Port to start the server on
     */
    udpPort: number;
}

export default class DNSServer extends ZoneHandler
{
    protected options: DNSServerOptions = {
        udpPort: 53,
        tcpPort: 53
    };

    protected tcpServer: net.Server;
    protected udpServer: dgram.Socket;

    protected currentQueries: DNSQuery[] = [];

    constructor( options?: Partial<DNSServerOptions> )
    {
        super(".");

        this.tcpServer = net.createServer();
        this.udpServer = dgram.createSocket("udp4");

        if(options !== undefined)
            this.options = Object.assign(this.options, options);
    }

    public listen(callback: () => void): void
    {
        this.udpServer.on("message", (msg: Buffer, rinfo: net.AddressInfo) =>
        {
            const request: DNSProtocol = new DNSProtocol();
            request.decode(msg);

            const response: DNSProtocol = DNSProtocol.createFromRequest(request);

            response.header.rCode.value = ReturnCode.NoError;
            response.header.aa = 1; // 1 if we hold authoritative data, 0 if data is from recursed information, matches the first answer...
            response.header.tc = 0; // 1 if we have truncated parts of the response (request can also be truncated but not supported yet either)

            response.questions.push(...request.questions);

            try
            {
                this.respond(new DNSQuery(rinfo, request, response));
            }
            catch(e)
            {
                response.header.rCode.value = ReturnCode.ServerFailure;
                this.logger?.error("DNS FAILURE: " + e.message)
            }

            if(response.answers.length === 0 && response.authorities.length === 0)
                response.header.rCode.value = ReturnCode.NameError;

            this.udpServer.send(response.encode(), rinfo.port, rinfo.address);
        });

        // this.tcpServer.listen(this.options.tcpPort);
        this.udpServer.bind(this.options.udpPort);

        callback();
    }
}
