import { Parser, IPv4, IPv6 } from "./index";

console.log(Parser.decode(IPv4, Parser.encode(IPv4, "8.8.8.8")));
console.log(Parser.decode(IPv6, Parser.encode(IPv6, "2001:4860:4860::8888")));