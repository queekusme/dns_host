export default abstract class Parser
{
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
}
