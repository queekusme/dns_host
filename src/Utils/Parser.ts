export default abstract class Parser<K>
{
    public abstract get value() : K;
    public abstract set value(v : K);

    /**
     * @param data - data to encode into a buffer which can be appended and sent as part of a dns response
     */
    public abstract encode(): Buffer;

    /**
     * @param data - buffer which contains the dns query to decode
     *
     * @returns number of bytes decoded
     */
    public abstract decode(data: Buffer): number;

    public static encode<T extends Parser<K>, K>(ParserClass: new (...args: any[]) => T, data: K): Buffer
    {
        const parser: T = new ParserClass();
        parser.value = data;

        return parser.encode();
    }

    public static decode<T extends Parser<K>, K>(ParserClass: new (...args: any[]) => T, data: Buffer): K
    {
        const parser: T = new ParserClass();
        parser.decode(data);

        return parser.value;
    }
}
