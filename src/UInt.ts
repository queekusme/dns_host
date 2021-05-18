import Parser from "./Utils/Parser";

abstract class UInt extends Parser<number>
{
    public get value() { return this._value; }
    public set value(value: number) { this._value = value % this.limit; }

    constructor(
        protected limit: number,
        protected _value: number = 0
    ) { super(); }
}

export class UInt4 extends UInt
{
    constructor(value?: number) { super(16, value); }

    /**
     * DO NOT USE!
     */
    public encode(): Buffer
    {
        throw new Error("Method not implemented.");
    }

    /**
     * DO NOT USE!
     */
    public decode(/* data: Buffer */): number
    {
        throw new Error("Method not implemented.");
    }
}

export class UInt8 extends UInt
{
    constructor(value?: number) { super(256, value); }

    public encode(): Buffer
    {
        return Buffer.from([this._value]); // Truncates to lowest 8 bits
    }

    public decode(data: Buffer): number
    {
        const value: Buffer = data.slice(0, 1);
        this._value = parseInt(value.toString("hex"), 16);

        return 1; // octets
    }
}

export class UInt16 extends UInt
{
    constructor(value?: number) { super(65536, value); }

    public encode(): Buffer
    {
        const rawData: number[] = [];

        rawData.push((this._value >> 8)); // Upper 8 bits
        rawData.push((this._value));      // Lower 8 bits

        return Buffer.from(rawData);
    }

    public decode(data: Buffer): number
    {
        const value: Buffer = data.slice(0, 2);
        this._value = parseInt(value.toString("hex"), 16);

        return 2; // octets
    }
}

export class UInt32 extends UInt
{
    constructor(value?: number) { super(2147483647, value); }

    public encode(): Buffer
    {
        const rawData: number[] = [];

        rawData.push((this._value >> 24)); // Top 8 bits
        rawData.push((this._value >> 16)); // Secondary 8 bits
        rawData.push((this._value >> 8)); // Tertiary 8 bits
        rawData.push((this._value));      // Lower 8 bits

        return Buffer.from(rawData);
    }

    public decode(data: Buffer): number
    {
        const value: Buffer = data.slice(0, 4);
        this._value = parseInt(value.toString("hex"), 16);

        return 4; // octets
    }
}
