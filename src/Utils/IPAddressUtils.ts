import { UInt16 } from "./UInt";
import Parser from "./Parser";

export class IPv4 extends Parser<string>
{
    public get value(): string { return this.address; }
    public set value(v: string) { this.address = v; }

    protected address: string = "";

    constructor(address?: string)
    {
        super();

        if(address !== undefined)
            this.address = address;
    }

    public encode(): Buffer
    {
        return Buffer.from(this.address.split(".").map((part: string) => parseInt(part)));
    }

    public decode(data: Buffer): number
    {
        this.address = [...data].map((part: number) => part.toString()).join(".");

        return data.length;
    }
}

export class IPv6 extends Parser<string>
{
    public get value(): string { return this.address; }
    public set value(v: string) { this.address = v; }

    protected address: string = "";

    constructor(address?: string)
    {
        super();

        if(address !== undefined)
            this.address = address;
    }

    public encode(): Buffer
    {
        return Buffer.concat(this.address.split(":").reduce((acc: UInt16[], current: string, _: number, arr: string[]) => {
            if (current.length > 0)
                acc.push(new UInt16(parseInt(current, 16)));

            else
                acc.push(...(new Array(8 - (arr.length - 1)).fill(0).map((part: number) => new UInt16(part))));

            return acc;
        }, [] as UInt16[]).map((data: UInt16) => data.encode()), 16); // 8 * 2 (octets)
    }

    public decode(data: Buffer): number
    {
        const buff: Buffer = Buffer.from(data); // Copy to preserve original data
        buff.swap16();
        this.address = [...new Uint16Array(buff.buffer, buff.byteOffset, buff.length / 2)].map((part: number) => {return part.toString(16);}).join(":");

        return 16; // 8 * 2 (octets)
    }
}
