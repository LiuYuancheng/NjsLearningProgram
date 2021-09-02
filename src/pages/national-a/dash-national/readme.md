National Dashboard



old national dashboard link: http://10.77.30.109:9012/signin , user/pwd : nationalA/nationala

national dashboard user admin link: https://10.77.30.109:9010/signin ,user/pwd : admin/admin

source code: https://10.77.10.108/TLP/customer-portal, dev_v3

```
D:\Projects\Dashboard_national>git clone --branch dev_v3 https://10.77.10.108/TLP/customer-portal.git
```

Graphql tutorial link: https://www.tutorialspoint.com/graphql/graphql_environment_setup.htm

druid API: http://druid.cdl.telco.lan/druid/v2, ,user/pwd : druid / Cwv9MSOeWwAQowy6H8Ry

Native queries: https://druid.apache.org/docs/latest/querying/querying.html



Angular handle input

https://stackoverflow.com/questions/42287304/pass-variable-to-custom-component

High chart word cloud: 

https://medium.com/@pmzubar/creating-awesome-word-clouds-using-highcarts-js-76967cb15c22

tool tip: 

https://material.angular.io/components/tooltip/overview

ng generate component dash-national-actors

ng generate component dash-national-client



Threat actor query: 

```
SELECT
threatName, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE threatType='IntrusionSet'
GROUP BY threatName
ORDER BY threatCount DESC
LIMIT 10

```

Threat namequery: 

```
SELECT
threatName, count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY threatName
ORDER BY threatCount DESC
LIMIT 10
```



SELECT __time,"count"
FROM "ds-suspected-ip-2019"
WHERE "__time" BETWEEN TIMESTAMP '2019-10-18 00:00:00' AND TIMESTAMP '2020-10-19 00:00:00' AND srcSector='GOVERNMENT'



SELECT
__time, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT'
GROUP BY __time
ORDER BY __time

SELECT
srcSector, count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY srcSector
ORDER BY threatCount DESC



SELECT __time, COUNT("count")
FROM "ds-findings-tor-2019"
WHERE srcSector = 'GOVERNMENT'
GROUP BY __time
ORDER BY __time



```
SELECT
__time, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT'
GROUP BY  __time
ORDER BY threatCount DESC
```

```
SELECT
__time, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT'
GROUP BY  __time
ORDER BY threatCount DESC
```

```
SELECT
__time, SUM("count") as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT'
GROUP BY  __time
ORDER BY threatCount DESC
```

Current select query

```
SELECT __time, COUNT(__time) as threatCount  FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT' 
GROUP BY __time
```

use data TRUNc

```
SELECT
DATE_TRUNC('hour', __time), count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY DATE_TRUNC('hour', __time)

```

