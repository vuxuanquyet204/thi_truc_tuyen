export const parseOwners = (input: string): string[] => {
	return input
		.split(/[\n,]/)
		.map((owner) => owner.trim())
		.filter((owner) => owner.length > 0)
}

export const formatWeiToEth = (valueInWei: string): string => {
	if (!valueInWei) return '0'
	try {
		const asNumber = Number(valueInWei)
		if (Number.isNaN(asNumber)) {
			const bigIntValue = BigInt(valueInWei)
			const whole = bigIntValue / BigInt(1e18)
			const fraction = bigIntValue % BigInt(1e18)
			const fractionStr = fraction.toString().padStart(18, '0').replace(/0+$/, '')
			return fractionStr.length > 0 ? `${whole.toString()}.${fractionStr}` : whole.toString()
		}
		return (asNumber / 1e18).toString()
	} catch {
		return valueInWei
	}
}
