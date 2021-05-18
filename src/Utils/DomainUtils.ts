import Parser from "./Parser";

export class DomainName extends Parser<string>
{
    public get value(): string { return this._domain; }
    public set value(value: string) { this._domain = value; }

    constructor(
        protected _domain: string = ""
    ) { super(); }

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
        const nameParts: string[] = (this._domain[0] === "." ? this.getReverse() : this._domain).split(".");
        let nameBuff: Buffer = Buffer.from([]);

        for(let i: number = 0; i < nameParts.length; i++)
        {
            if(i + 1 === nameParts.length)
                nameBuff = Buffer.concat([nameBuff, Buffer.from([0])], nameBuff.length + 1);
            else
                nameBuff = Buffer.concat([nameBuff, Buffer.from([nameParts[i].length]), Buffer.from(nameParts[i])], nameBuff.length + 1 + nameParts[i].length);
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

            currentBufferOctetsProcessed++;

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
