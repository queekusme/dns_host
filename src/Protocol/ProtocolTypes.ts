import { UInt16, UInt32, UInt4 } from "../UInt";
import { DomainName } from "../Utils/DomainUtils";
import Parser from "../Utils/Parser";

export enum QR
{
    Query = 0,
    Response = 1
}

export enum Opcode
{
    /**
     * A Standard DNS Query
     */
    Standard = 0,

    /**
     * An Inverse Query
     */
    Inverse = 1,

    /**
     * A Server Status Request
     */
    Status = 2

    /* 3-15 - reserved for future use */
}

export enum ReturnCode
{
    NoError = 0,

    /**
     * The name server was unable to interpret the query
     */
    FormatError = 1,

    /**
     * The name server was unable to process this query due to a problem with the name server
     */
    ServerFailure = 2,

    /**
     * Meaningful only for responses from an authoritative name server,
     * this code signifies that the domain name referenced in the query does not exist
     */
    NameError = 3,

    /**
     * The name server does not support the requested kind of query
     */
    NotImplemented = 4,

    /**
     * The name server refuses to perform the specified operation for policy reasons.
     * For example, a name server may not wish to provide the information to the
     * particular requester, or a name server may not wish to perform a particular
     * operation (e.g., zone transfer) for particular data
     */
    Refused = 5

    /* 6-15 - reserved for future use */
}

export type Bit = 0 | 1;

export enum Type
{
    /**
     * A Host Address (IPv4)
     */
    A = 1,

    /**
     * An Authoritative Name Server
     */
    NS = 2,

    /**
     * A Mail Destination
     *
     * @deprecated - use MX
     */
    MD = 3,

    /**
     * A Mail Forwarder
     *
     * @deprecated - use MX
     */
    MF = 4,

    /**
     * The canonical name for an Alias
     */
    CNAME = 5,

    /**
     * Marks the Start of a Zone of Authority
     */
    SOA = 6,

    /**
     * A Mailbox Domain Name
     *
     * EXPERIMENTAL
     */
    MB = 7,

    /**
     * A Mail Group MEmber
     */
    MG = 8,

    /**
     * A Mail rename Domain Name
     */
    MR = 9,

    /**
     * A Null RR
     *
     * EXPERIMENTAL
     */
    NULL = 10,

    /**
     * A Well Known Service Description
     */
    WKS = 11,

    /**
     * A Domain Pointer
     */
    PTR = 12,

    /**
     * Host Information
     */
    HINFO = 13,

    /**
     * Mailbox or Mail List information
     */
    MINFO = 14,

    /**
     * A Mail Exchange
     */
    MX = 15,

    /**
     * Text Strings
     */
    TX = 16,

    /**
     * A Host Address (IPv6)
     */
    AAAA = 28
}

export enum QTypeAdditionals
{
    /**
     * A request for a transfer of an entire zone
     */
    AXFR = 252,

    /**
     * A request for mailbox-related records (MB, MG or MR)
     */
    MAILB = 253,

    /**
     * A request for mail agent RRs
     *
     * @deprecated see MX
     */
    MAILA = 254,

    /**
     * A request for all records
     */
    ALL = 255
}

export enum Class
{
    /**
     * The Internet
     */
    IN = 1,

    /**
     * CSNET
     *
     * @deprecated
     */
    CS = 2,

    /**
     * CHAOS
     */
    CH = 3,

    /**
     * HESIOD
     */
    HS = 4
}

export class DNSProtocolHeader extends Parser<undefined>
{
    public get value(): undefined { return undefined;  }
    public set value(v: undefined) { } // eslint-disable-line @typescript-eslint/no-empty-function

    /**
     * A 16 bit identifier assigned by the program that
     * generates any kind of query.  This identifier is copied
     * the corresponding reply and can be used by the requester
     * to match up replies to outstanding queries.
     */
    public txId: UInt16 = new UInt16();

    /**
     * A one bit field that specifies whether this message is a
     * query (0), or a response (1)
     *
     * @see QR
     */
    public qr: Bit = 0;

    /**
     * A four bit field that specifies kind of query in this
     * message.  This value is set by the originator of a query
     * and copied into the response.
     *
     * @see Opcode
     */
    public opcode: UInt4 = new UInt4(); // 4 Bits

    /**
     * Authoritative Answer - this bit is valid in responses,
     * and specifies that the responding name server is an
     * authority for the domain name in question section.

     * Note that the contents of the answer section may have
     * multiple owner names because of aliases.  The AA bit
     * corresponds to the name which matches the query name, or
     * the first owner name in the answer section.
     */
    public aa: Bit = 0;

    /**
     * Truncation - specifies that this message was truncated
     * due to length greater than that permitted on the
     * transmission channel
     */
    public tc: Bit = 0;

    /**
     * Recursion Desired - this bit may be set in a query and
     * is copied into the response.  If RD is set, it directs
     * the name server to pursue the query recursively.
     * Recursive query support is optional
     */
    public rd: Bit;

    /**
     * Recursion Available - this bit is set or cleared in a
     * response, and denotes whether recursive query support is
     * available in the name server
     */
    public ra: Bit = 0;

    /**
     * Reserved for future use.  Must be zero in all queries
     * and responses
     */
    public z: Bit = 0;

    /**
     * As specified in RFC 2535 (section 6.1), the AD (Authenticated Data)
     * bit indicates in a response that all data included in the answer and
     * authority sections of the response have been authenticated by the
     * server according to the policies of that server.  This is not
     * especially useful in practice, since a conformant server SHOULD never
     * reply with data that failed its security policy.
     *
     * This document redefines the AD bit such that it is only set if all
     * data in the response has been cryptographically verified or otherwise
     * meets the server's local security policy.  Thus, neither a response
     * containing properly delegated insecure data, nor a server configured
     * without DNSSEC keys, will have the AD set.  As before, data that
     * failed to verify will not be returned.  An application running on a
     * host that has a trust relationship with the server performing the
     * recursive query can now use the value of the AD bit to determine
     * whether the data is secure.
     */
    public ad: Bit = 0;

    /**
     * The CD bit exists in order to allow a security-aware resolver to
     * disable signature validation in a security-aware name server's
     * processing of a particular query.
     *
     * The name server side MUST copy the setting of the CD bit from a query
     * to the corresponding response.
     */
    public cd: Bit = 0;

    /**
     * Response code - this 4 bit field is set as part of
     * responses
     *
     * @see ReturnCode
     */
    public rCode: UInt4 = new UInt4();

    /**
     * an unsigned 16 bit integer specifying the number of
     * entries in the question section
     */
    public qdCount: UInt16 = new UInt16();

    /**
     * an unsigned 16 bit integer specifying the number of
     * resource records in the answer section
     */
    public anCount: UInt16 = new UInt16();

    /**
     * an unsigned 16 bit integer specifying the number of name
     * server resource records in the authority records
     * section
     */
    public nsCount: UInt16 = new UInt16();

    /**
     * an unsigned 16 bit integer specifying the number of
     * resource records in the additional records section
     */
    public arCount: UInt16 = new UInt16();

    public decode(data: Buffer): number
    {
        this.txId.decode(data.slice(0, 2));

        const flags_1: Buffer = data.slice(2, 3);
        const flags_1_num: number = parseInt(flags_1.toString("hex"), 16);

        this.qr = ((flags_1_num >> 7) & 0b00000001) === 0 ? 0 : 1;
        this.opcode.value = (flags_1_num >> 3) & 0b00001111;
        this.aa = ((flags_1_num >> 2) & 0b00000001) === 0 ? 0 : 1;
        this.tc = ((flags_1_num >> 1) & 0b00000001) === 0 ? 0 : 1;
        this.rd = ((flags_1_num >> 0) & 0b00000001) === 0 ? 0 : 1;

        const flags_2: Buffer = data.slice(3, 4);
        const flags_2_num: number = parseInt(flags_2.toString("hex"), 16);

        this.ra = ((flags_2_num >> 7) & 0b00000001) === 0 ? 0 : 1;
        this.z = ((flags_2_num >> 6) & 0b00000001) === 0 ? 0 : 1;
        this.ad = ((flags_2_num >> 5) & 0b00000001) === 0 ? 0 : 1;
        this.cd = ((flags_2_num >> 4) & 0b00000001) === 0 ? 0 : 1;
        this.rCode.value = (flags_2_num >> 0) & 0b00001111;

        this.qdCount.decode(data.slice(4, 6));
        this.anCount.decode(data.slice(6, 8));
        this.nsCount.decode(data.slice(8, 10));
        this.arCount.decode(data.slice(10, 12));

        return 12; // 6 pairs of 8 octets
    }

    public encode(): Buffer
    {
        const txID: Buffer = this.txId.encode();

        const flagsData: number[] = [];
        flagsData.push((this.qr << 7) + (this.opcode.value << 6) + (this.aa << 2) + (this.tc << 1) + (this.rd << 0)); // Flags upper bits
        flagsData.push((this.ra << 7) + (this.z << 6) + (this.ad << 5) + (this.cd << 4) + (this.rCode.value << 0));   // Flags lower bits
        const flags: Buffer = Buffer.from(flagsData);

        const qdCount: Buffer = this.qdCount.encode();
        const anCount: Buffer = this.anCount.encode();
        const nsCount: Buffer = this.nsCount.encode();
        const arCount: Buffer = this.arCount.encode();

        return Buffer.concat(
            [txID, flags, qdCount, anCount, nsCount, arCount ],
            txID.length + flags.length + qdCount.length + anCount.length + nsCount.length + arCount.length);
    }
}

export class DNSProtocolQuestion extends Parser<undefined>
{
    public get value(): undefined { return undefined;  }
    public set value(v: undefined) { } // eslint-disable-line @typescript-eslint/no-empty-function

    /**
     * A domain name represented as a sequence of labels, where
     * each label consists of a length octet followed by that
     * number of octets.  The domain name terminates with the
     * zero length octet for the null label of the root.  Note
     * that this field may be an odd number of octets; no
     * padding is used.
     *
     * This string contains the fully qualified domain name including
     * its final . character for the root zone
     *
     * e.g. 'google.com.'
     */
    public qName: DomainName = new DomainName();

    /**
     * A two octet code which specifies the type of the query.
     * The values for this field include all codes valid for a
     * TYPE field, together with some more general codes which
     * can match more than one type of RR.
     *
     * @see QType
     */
    public qType: UInt16 = new UInt16();

    /**
     * A two octet code that specifies the class of the query.
     * For example, the QCLASS field is IN for the Internet.
     *
     * @see Class
     */
    public qClass: UInt16 = new UInt16();

    public decode(data: Buffer): number
    {
        let decodedBufferLength: number = this.qName.decode(data);
        decodedBufferLength += this.qType.decode(data.slice(decodedBufferLength, decodedBufferLength + 2));
        decodedBufferLength += this.qClass.decode(data.slice(decodedBufferLength, decodedBufferLength + 2));

        return decodedBufferLength;
    }

    public encode(): Buffer
    {
        const name: Buffer = this.qName.encode();
        const type: Buffer = this.qType.encode();
        const qClass: Buffer = this.qType.encode();

        return Buffer.concat([name, type, qClass ], name.length + type.length + qClass.length);
    }
}

export enum DNSProtocolResourceRecordDataIdentifier
{
    UNKNOWN, Name, IPv4, IPv6
}

export class DNSProtocolResourceRecord extends Parser<undefined>
{

    public get value(): undefined { return undefined;  }
    public set value(v: undefined) { } // eslint-disable-line @typescript-eslint/no-empty-function

    /**
     * A domain name to which this resource record pertains
     *
     * This string contains the fully qualified domain name including
     * its final . character for the root zone
     *
     * e.g. 'google.com.'
     */
    public name: DomainName = new DomainName();

    /**
     * Two octets containing one of the RR type codes.  This
     * field specifies the meaning of the data in the RDATA
     * field
     */
    public type: UInt16 = new UInt16();

    /**
     * Two octets which specify the class of the data in the
     * RDATA field
     */
    public rClass: UInt16 = new UInt16();

    /**
     * A 32 bit unsigned integer that specifies the time
     * interval (in seconds) that the resource record may be
     * cached before it should be discarded.  Zero values are
     * interpreted to mean that the RR can only be used for the
     * transaction in progress, and should not be cached
     */
    public ttl: UInt32 = new UInt32();

    /**
     * An unsigned 16 bit integer that specifies the length in
     * octets of the RDATA field
     */
    public get rdLength(): UInt16 { return new UInt16(this.rData.length); }

    /**
     * A variable length string of octets that describes the
     * resource.  The format of this information varies
     * according to the TYPE and CLASS of the resource record.
     * For example, the if the TYPE is A and the CLASS is IN,
     * the RDATA field is a 4 octet ARPA Internet address
     *
     * Represented as an array of octets
     */
    public rData: Uint8Array = new Uint8Array();

    /**
     * An identifier which can be set to allow for easier identification of the provided data,
     * UNDEFINED for all incoming data, no assumptions are made
     */
    public rDataType: DNSProtocolResourceRecordDataIdentifier = DNSProtocolResourceRecordDataIdentifier.UNKNOWN;

    /**
     * Construct a DNSProtocolResourceRecord from constituant parts
     *
     * @returns Constructed DNSProtocolResourceRecord
     */
    public static of(
        name: string | DomainName,
        type: UInt16,
        rClass: UInt16,
        ttl: UInt32,
        rData: Uint8Array
    ): DNSProtocolResourceRecord
    {
        const record: DNSProtocolResourceRecord = new DNSProtocolResourceRecord();
        record.name = (name instanceof DomainName) ? name : new DomainName(name);
        record.type = type;
        record.rClass = rClass;
        record.ttl = ttl;
        record.rData = rData;

        return record;
    }

    public decode(data: Buffer): number
    {
        let decodedBufferLength: number = this.name.decode(data);
        decodedBufferLength += this.type.decode(data.slice(decodedBufferLength, decodedBufferLength + 2));
        decodedBufferLength += this.rClass.decode(data.slice(decodedBufferLength, decodedBufferLength + 2));
        decodedBufferLength += this.ttl.decode(data.slice(decodedBufferLength, decodedBufferLength + 4));
        decodedBufferLength += this.rdLength.decode(data.slice(decodedBufferLength, decodedBufferLength + 2));

        this.rData = data.slice(decodedBufferLength, decodedBufferLength + this.rdLength.value);

        decodedBufferLength += this.rData.length;

        return decodedBufferLength;
    }

    public encode(): Buffer
    {
        const name: Buffer = this.name.encode();
        const type: Buffer = this.type.encode();
        const rClass: Buffer = this.rClass.encode();
        const ttl: Buffer = this.ttl.encode();
        const rdLength: Buffer = this.rdLength.encode();
        const rData: Buffer = Buffer.from(this.rData);

        return Buffer.concat(
            [ name, type, rClass, ttl, rdLength, rData ],
            name.length + type.length + rClass.length + ttl.length + rdLength.length + rData.length);
    }
}

export class DNSProtocol extends Parser<undefined>
{
    public get value(): undefined { return undefined;  }
    public set value(v: undefined) { } // eslint-disable-line @typescript-eslint/no-empty-function
    /**
     * The header of this DNS Packet
     */
    public readonly header: DNSProtocolHeader = new DNSProtocolHeader();

    /**
     * Questions included in this DNS Packet
     */
    public readonly questions: DNSProtocolQuestion[] = [];

    /**
     * Answers included in this DNS Packet
     */
    public readonly answers: DNSProtocolResourceRecord[] = [];

    /**
     * Name Server Records included in this DNS Packet
     */
    public readonly authorities: DNSProtocolResourceRecord[] = [];

    /**
     * Additonal Resource Records in this DNS Packet
     */
    public readonly additionals: DNSProtocolResourceRecord[] = [];

    private static _encode<T extends Parser<K>, K>(parsable: T): [Buffer, number]
    {
        const data: Buffer = parsable.encode();

        return [data, data.length];
    }

    public decode(data: Buffer): number
    {
        const headerLength: number = this.header.decode(data.slice(0, 12)); // 12 octets (6 parts of 16 bits)

        let questionStart: number = headerLength;
        let accQuestionsLength: number = 0;
        for(let i: number = 0; i < this.header.qdCount.value; i++)
        {
            const question: DNSProtocolQuestion = new DNSProtocolQuestion();
            const length: number = question.decode(data.slice(questionStart)); // Slice whole as we know not where the end is

            questionStart += length;
            accQuestionsLength += length;
            this.questions.push(question);
        }

        // TODO: Decode Answers
        // TODO: Decode Authorities
        // TODO: Decode Additionals

        return headerLength + accQuestionsLength;
    }

    public encode(): Buffer
    {
        let questions: Buffer = Buffer.from([]);
        for(let i: number = 0; i < this.questions.length; i++)
        {
            const [question, questionLength] = DNSProtocol._encode(this.questions[i]);
            questions = Buffer.concat([questions, question], questions.length + questionLength);
        }

        let answers: Buffer = Buffer.from([]);
        for(let i: number = 0; i < this.answers.length; i++)
        {
            const [answer, answerLength] = DNSProtocol._encode(this.answers[i]);
            answers = Buffer.concat([answers, answer], answers.length + answerLength);
        }

        let authorities: Buffer = Buffer.from([]);
        for(let i: number = 0; i < this.authorities.length; i++)
        {
            const [authority, authorityLength] = DNSProtocol._encode(this.authorities[i]);
            authorities = Buffer.concat([authorities, authority], authorities.length + authorityLength);
        }

        let additionals: Buffer = Buffer.from([]);
        for(let i: number = 0; i < this.additionals.length; i++)
        {
            const [additional, additionalLength] = DNSProtocol._encode(this.additionals[i]);
            additionals = Buffer.concat([additionals, additional], additionals.length + additionalLength);
        }

        this.header.qdCount.value = this.questions.length;
        this.header.anCount.value = this.answers.length;
        this.header.nsCount.value = this.authorities.length;
        this.header.arCount.value = this.additionals.length;

        // Encode header last so we can set values pertaining to response body
        const [header, headerLength] = DNSProtocol._encode(this.header);

        return Buffer.concat(
            [header, questions, answers, authorities, additionals],
            headerLength + questions.length + answers.length + authorities.length + additionals.length);
    }

    /**
     * Creates a DNSProtocol object which has relevant
     * information transferred from the request as well
     * as required response data set by default
     */
    public static createFromRequest(request: DNSProtocol): DNSProtocol
    {
        const response: DNSProtocol = new DNSProtocol();
        response.header.txId = request.header.txId;
        response.header.qr = QR.Response;
        response.header.opcode.value = Opcode.Standard;
        response.header.rd = request.header.rd;
        response.header.ra = 0;
        response.header.z = 0;
        response.header.ad = 0;
        response.header.cd = request.header.cd;

        return response;
    }
}
