import { expect } from "chai";
import { IPv4, IPv6 } from "../../src/Utils/IPAddressUtils";

describe("Test IP Address Utils", () =>
{
    describe("Test IPv4", () =>
    {
        it("can encode to a valid buffer", () =>
        {
            expect([...new IPv4("192.168.1.10").encode()]).to.deep.equal([192, 168, 1, 10]);
        });
        it("can decode a valid buffer", () =>
        {
            const encoded: Buffer = Buffer.from([192, 168, 1, 10]);

            const decodedDomain: IPv4 = new IPv4();
            decodedDomain.decode(encoded);

            expect(decodedDomain.value).to.equal("192.168.1.10");
        });
        it("can encode data then decode back into the original data", () =>
        {
            const addrerssToEncodeDecode: IPv4 = new IPv4("192.168.1.10");

            const encoded: Buffer = addrerssToEncodeDecode.encode();

            const decodedAddress: IPv4 = new IPv4();
            decodedAddress.decode(encoded);

            expect(decodedAddress.value).to.equal(addrerssToEncodeDecode.value);
        });
    });
    describe("Test IPv6", () =>
    {
        it("can encode to a valid buffer", () =>
        {
            expect([...new IPv6("2001:4860:4860:0000:0000:0000:0000:8888").encode()]).to.deep.equal([32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136]);
        });
        it("can decode a valid buffer", () =>
        {
            const encoded: Buffer = Buffer.from([32, 1, 72, 96, 72, 96, 0, 0, 0, 0, 0, 0, 0, 0, 136, 136]);

            const decodedDomain: IPv6 = new IPv6();
            decodedDomain.decode(encoded);

            expect(decodedDomain.value).to.equal("2001:4860:4860:0:0:0:0:8888");
        });
        it("can encode data then decode back into the original data", () =>
        {
            const addrerssToEncodeDecode: IPv6 = new IPv6("2001:4860:4860:0:0:0:0:8888");

            const encoded: Buffer = addrerssToEncodeDecode.encode();

            const decodedAddress: IPv6 = new IPv6();
            decodedAddress.decode(encoded);

            expect(decodedAddress.value).to.equal(addrerssToEncodeDecode.value);
        });
        it("can encode comprerssed data then decode back into the uncompressed data", () =>
        {
            const addrerssToEncodeDecode: IPv6 = new IPv6("2001:4860:4860::8888");

            const encoded: Buffer = addrerssToEncodeDecode.encode();

            const decodedAddress: IPv6 = new IPv6();
            decodedAddress.decode(encoded);

            expect(decodedAddress.value).to.equal("2001:4860:4860:0:0:0:0:8888");
        });
    });
});
