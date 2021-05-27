import { expect } from "chai";
import { UInt16, UInt32, UInt4, UInt8 } from "../../src/Utils/UInt";

describe("Test Uint Utils", () =>
{
    describe("Test UInt4", () =>
    {
        it("initialises value to zero", () =>
        {
            expect(new UInt4().value).to.equal(0);
        });

        it("accept any value < 16 as valid", () =>
        {
            const uint4: UInt4 = new UInt4();
            for(let i: number = 0; i < 16; i++)
            {
                uint4.value = i;

                expect(uint4.value).to.equal(i);
            }
        });

        it("expect values >= 16 to wrap around", () =>
        {
            const uint4: UInt4 = new UInt4();
            for(let i: number = 16; i < 32; i++)
            {
                uint4.value = i;

                expect(uint4.value).to.equal(i - 16);
            }
        });

        it("expect encode to reject, UInt4 cannot be correctly encoded into a UInt8", () =>
        {
            const uint4: UInt4 = new UInt4();

            expect(uint4.encode.bind(uint4)).to.throw("Method not implemented.");
        });

        it("expect decode to reject, UInt4 cannot be correctly encoded into a UInt8", () =>
        {
            const uint4: UInt4 = new UInt4();

            expect(uint4.decode.bind(uint4, Buffer.from([]))).to.throw("Method not implemented.");
        });
    });

    describe("Test UInt8", () =>
    {
        it("initialises value to zero", () =>
        {
            expect(new UInt8().value).to.equal(0);
        });

        it("accept any value < 256 as valid (trim to last 64 for ms)", () =>
        {
            const uint8: UInt8 = new UInt8();
            for(let i: number = 256 - 64; i < 256; i++)
            {
                uint8.value = i;

                expect(uint8.value).to.equal(i);
            }
        });

        it("expect values >= 256 to wrap around (trim to last 64 for ms)", () =>
        {
            const uint8: UInt8 = new UInt8();
            for(let i: number = 512 - 64 ; i < 512; i++)
            {
                uint8.value = i;

                expect(uint8.value).to.equal(i - 256);
            }
        });

        it("expect UInt8 to successfully encode", () =>
        {
            expect([...new UInt8(14).encode()]).to.deep.equal([14]);
        });

        it("expect UInt8 to successfully decode", () =>
        {
            const uint8: UInt8 = new UInt8();
            uint8.decode(Buffer.from([14]));

            expect(uint8.value).to.equal(14);
        });
    });

    describe("Test UInt16", () =>
    {
        it("initialises value to zero", () =>
        {
            expect(new UInt16().value).to.equal(0);
        });

        it("accept any value < 65536 as valid (trim to last 64 for ms)", () =>
        {
            const uint16: UInt16 = new UInt16();
            for(let i: number = 65536 - 64; i < 65536; i++)
            {
                uint16.value = i;

                expect(uint16.value).to.equal(i);
            }
        });

        it("expect values >= 65536 to wrap around (trim to last 64 for ms)", () =>
        {
            const uint16: UInt16 = new UInt16();
            for(let i: number = 131072 - 64; i < 131072; i++)
            {
                uint16.value = i;

                expect(uint16.value).to.equal(i - 65536);
            }
        });

        it("expect UInt16 to successfully encode", () =>
        {
            expect([...new UInt16(12345).encode()]).to.deep.equal([48, 57]);
        });

        it("expect UInt16 to successfully decode", () =>
        {
            const uint16: UInt16 = new UInt16();
            uint16.decode(Buffer.from([48, 57]));

            expect(uint16.value).to.equal(12345);
        });
    });

    describe("Test UInt32", () =>
    {
        it("initialises value to zero", () =>
        {
            expect(new UInt32().value).to.equal(0);
        });

        it("accept any value < 2147483647 as valid (trim to last 64 for ms)", () =>
        {
            const uint32: UInt32 = new UInt32();
            for(let i: number = 2147483647 - 64; i < 2147483647; i++)
            {
                uint32.value = i;

                expect(uint32.value).to.equal(i);
            }
        });

        it("expect values >= 2147483647 to wrap around (trim to last 64 for ms)", () =>
        {
            const uint32: UInt32 = new UInt32();
            for(let i: number = 4294967294 - 64; i < 4294967294; i++)
            {
                uint32.value = i;

                expect(uint32.value).to.equal(i - 2147483647);
            }
        });

        it("expect UInt32 to successfully encode", () =>
        {
            expect([...new UInt32(1234567890).encode()]).to.deep.equal([73, 150, 2, 210]);
        });

        it("expect UInt32 to successfully decode", () =>
        {
            const uint32: UInt32 = new UInt32();
            uint32.decode(Buffer.from([73, 150, 2, 210]));

            expect(uint32.value).to.equal(1234567890);
        });
    });
});
