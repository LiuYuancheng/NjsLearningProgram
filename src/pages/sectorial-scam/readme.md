

create lookup

find all the IP's country code:

```
SELECT dstNodeId, dstCountry
FROM "ds-findings-scam-url-ioc-2019"
GROUP BY dstNodeId, dstCountry
```



WHERE lookup(dstNodeId, 'lookup-ip-country')='SG'

```
WHERE lookup(dstNodeId, 'lookup-ip-country')='SG'
```

filter 

```
SELECT srcSector,
count(*) as threatCount
FROM "ds-findings-scams-matched-results"
WHERE lookup(dstNodeId, 'lookup-ip-country')='SG'
GROUP BY srcSector
```

campaign cat

```
SELECT campaignId,
count(*) as threatCount
FROM "ds-findings-scams-matched-results"
WHERE lookup(dstNodeId, 'lookup-ip-country')='RU'
GROUP BY campaignId
```

