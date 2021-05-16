class UInt
{
    constructor(
        protected limit: number,
        protected _value: number = 0
    ) { }

    public get value() { return this._value; }

    public set value(value: number) {
        this._value = value % this.limit;
    }
}

export class UInt4 extends UInt
{
    constructor(value?: number) { super(16, value); }
}

export class UInt8 extends UInt
{
    constructor(value?: number) { super(256, value); }
}

export class UInt16 extends UInt
{
    constructor(value?: number) { super(65536, value); }
}
