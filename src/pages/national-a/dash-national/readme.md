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





ng generate component dash-national-actors



actor query: 

```
SELECT
threatName, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE threatType='IntrusionSet'
GROUP BY threatName
ORDER BY threatCount DESC
LIMIT 10

```

