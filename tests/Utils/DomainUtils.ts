import { expect } from "chai";
import DomainName from "../../src/Utils/DomainUtils";

describe("Test DomainUtils", () =>
{
    it("can encode to a valid buffer", () =>
    {
        expect([...new DomainName("google.com").encode()]).to.deep.equal([6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109, 0]);
    });
    it("can decode a valid buffer", () =>
    {
        const encoded: Buffer = Buffer.from([6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109, 0]);

        const decodedDomain: DomainName = new DomainName();
        decodedDomain.decode(encoded);

        expect(decodedDomain.value).to.equal("google.com.");
    });
    it("can encode data then decode back into the original data", () =>
    {
        const nameToEncodeDecode: DomainName = new DomainName("google.com");

        const encoded: Buffer = nameToEncodeDecode.encode();

        const decodedDomain: DomainName = new DomainName();
        decodedDomain.decode(encoded);

        expect(decodedDomain.value).to.equal(nameToEncodeDecode.value);
    });
    it("can handle a malformatted buffer (no initial length)", () =>
    {
        const encoded: Buffer = Buffer.from([103, 111, 111, 103, 108, 101, 3, 99, 111, 109, 0]);

        const decoded = new DomainName();
        expect(decoded.decode.bind(decoded, encoded)).to.throw("Malformed Data, Label Length Greater than Remaining Buffer Size");
    });
    it("can handle a malformatted buffer (no length in middle section)", () =>
    {
        const encoded: Buffer = Buffer.from([6, 103, 111, 111, 103, 108, 101, 99, 111, 109, 0]);

        const decoded = new DomainName();
        expect(decoded.decode.bind(decoded, encoded)).to.throw("Malformed Data, Label Length Greater than Remaining Buffer Size");
    });
    it("can handle a malformatted buffer (no ending 0)", () =>
    {
        const encoded: Buffer = Buffer.from([6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109]);

        const decoded = new DomainName();
        expect(decoded.decode.bind(decoded, encoded)).to.throw("Malformed Data, Label data stops prematurely");
    });
});