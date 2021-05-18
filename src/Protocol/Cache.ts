import { DNSProtocolResourceRecordAcceptedTypes, Type } from "./ProtocolTypes";
import { DomainName } from "Utils/DomainUtils";
import { DNSProtocolResourceRecord } from "./ProtocolTypes";

/**
 * Represents a cache handler
 *
 * Is responsible for getting, returning and
 * invalidating cache entries
 *
 * Cache handlers can manually add their own
 * invalidation based on TTL and the datetime
 * in put. This is entirely optional based on
 * the preference of the cache handler; however
 * cache must be invalidated if requested by
 * invalidate(...)
 */
export default abstract class Cache
{
    /**
     * Put a record into cache, using the current datetime to establish ttl boundries
     */
    public abstract put(records: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[], current: Date): void

    /**
     * Get a record from cache (if exsists) based on the name requested
     */
    public abstract get(key: DomainName | string): DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]

    /**
     * Manually invalidate a cache record based on its name
     */
    public abstract invalidate(name: DomainName | string): void
}

interface ICacheEntry
{
    record: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>;
    lastUpdated: Date;
}

interface IBasicMemoryCache
{
    [name: string]: ICacheEntry
}

export class BasicMemoryCache extends Cache
{
    protected cache: IBasicMemoryCache = {};

    public put(records: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[], current: Date): void
    {
        for(const cacheRecord of records)
        {
            this.cache[cacheRecord.name.toString()] = {
                record: cacheRecord,
                lastUpdated: current
            };
        }
    }

    public get(key: string | DomainName): DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[]
    {
        const data: DNSProtocolResourceRecord<DNSProtocolResourceRecordAcceptedTypes>[] = [];

        const cacheEntry: ICacheEntry | undefined = this.cache[key.toString()];

        if(cacheEntry === undefined)
            return data;

        if(Date.now() > (cacheEntry.lastUpdated.getTime() + cacheEntry.record.ttl.value * 1000))
            this.invalidate(key);

        switch(cacheEntry.record.type.value)
        {
            case Type.CNAME:
                data.push(...this.get(cacheEntry.record.rData.value)); break;
            default: break; // If not explicitly defined, data needs no further cache lookups

        }

        return data;
    }

    public invalidate(name: string | DomainName): void
    {
        delete this.cache[name.toString()];
    }
}
