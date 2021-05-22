import Parser from "./Parser";

export default class DomainName extends Parser<string>
{
    public get value(): string { return this._domain; }
    public set value(value: string) { this._domain = value; }

    /**
     * Create a representation of a domain name
     *
     * If a period '.' is not found at the beginning or end, one is automatically added at the end,
     *
     * e.g.
     * - google.com would be come google.com.
     */
    constructor(
        protected _domain: string = ""
    )
    {
        super();

        if((this._domain.split(".") as (string|undefined)[]).indexOf("") === -1)
            this._domain = `${this._domain}.`;
    }

    public clone(withAddition: string = ""): DomainName
    {
        return new DomainName(withAddition.length > 0 ? `${withAddition}.${this._domain}` : this._domain);
    }

    /**
     * Reverses a domain label,
     *
     * e.g.
     * - google.com. would become .com.google
     * - .com.google would become google.com.
     *
     * @param label - label to reverse
     * @returns the reversed label
     */
    public getReverse(): string
    {
        return this._domain.split(".").reverse().join(".");
    }

    public encode(): Buffer
    {
        const nameParts: (string | undefined)[] = (this._domain[0] === "." ? this.getReverse() : this._domain).split(".");

        let nameBuff: Buffer = Buffer.from([]);

        for(const part of nameParts)
        {
            if(part === undefined)
                nameBuff = Buffer.concat([nameBuff, Buffer.from([0])], nameBuff.length + 1);
            else
                nameBuff = Buffer.concat([nameBuff, Buffer.from([part.length]), Buffer.from(part)], nameBuff.length + 1 + part.length);
        }

        return nameBuff;
    }

    public decode(data: Buffer): number
    {
        let decodedBufferLength: number = 0;
        while(true)
        {
            let currentBufferOctetsProcessed: number = 0;

            const labelLengthBuff: Buffer = data.slice(decodedBufferLength, decodedBufferLength + 1);
            const labelLength: number = parseInt(labelLengthBuff.toString("hex"), 16);

            if(isNaN(labelLength))
                throw new Error("Malformed Data, Label data stops prematurely");

            currentBufferOctetsProcessed++;

            if(labelLength > data.length - currentBufferOctetsProcessed) // length > remaining buffer
            {
                throw new Error("Malformed Data, Label Length Greater than Remaining Buffer Size");
            }

            if(labelLength === 0)
            {
                decodedBufferLength += currentBufferOctetsProcessed;
                break; // Reached null label for root zone
            }

            const labelBuffer: Buffer = data.slice(decodedBufferLength + 1, decodedBufferLength + 1 + labelLength);
            this._domain = this._domain + labelBuffer.toString() + ".";

            currentBufferOctetsProcessed += labelLength;

            decodedBufferLength += currentBufferOctetsProcessed;
        }

        return decodedBufferLength;
    }

    public toString(): string
    {
        return this._domain;
    }
}
