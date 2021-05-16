import { DomainName } from "./Utils/DomainUtils";

export function ipV4ToUint8Array(ipV4: string): Uint8Array
{
    return new Uint8Array(ipV4.split(".").map((part: string) => parseInt(part)));
}

export function getAuthoritativePartFromQuestionName(zone: string, questionFullName: string): string
{
    let zoneName: string = zone;
    if(zoneName.length > 0 && zoneName[0] === ".")
        zoneName = new DomainName(zoneName).getReverse();

    const fullParts: string = questionFullName.replace(zoneName, "");

    return questionFullName.replace(zoneName, "").slice(0, fullParts.length - 1);
}
