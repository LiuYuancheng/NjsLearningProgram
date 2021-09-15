# National Profile Dashboard

This module is used to create a dashboard web page to show the national profile threat data. 

[TOC]

------

#### Important link

Dashboard link: http://localhost:4200/#/dash-national

Graphql console link: https://localhost:9011/graphql

Graphql create a valid account: https://localhost:9011/documentation/

Graphql tutorial link: https://www.tutorialspoint.com/graphql/graphql_environment_setup.htm



Original national dashboard link: http://10.77.30.109:9012/signin , user/pwd : nationalA/nationala

Original  national dashboard user admin link: https://10.77.30.109:9010/signin ,user/pwd : admin/admin

Original  national dashboard source code: https://10.77.10.108/TLP/customer-portal, dev_v3

```
D:\Projects\Dashboard_national>git clone --branch dev_v3 https://10.77.10.108/TLP/customer-portal.git
```



Druid console link: http://druid.cdl.telco.lan/unified-console.html

Druid API: http://druid.cdl.telco.lan/druid/v2, ,user/pwd : druid / Cwv9MSOeWwAQowy6H8Ry

Native queries: https://druid.apache.org/docs/latest/querying/querying.html



Angular function handle input https://stackoverflow.com/questions/42287304/pass-variable-to-custom-component

Angular High chart word cloud: https://medium.com/@pmzubar/creating-awesome-word-clouds-using-highcarts-js-76967cb15c22

Angular Check box event: https://www.concretepage.com/angular-material/angular-material-checkbox-change-event

Angular tool tip: https://material.angular.io/components/tooltip/overview

p-card detail: https://www.bookstack.cn/read/PrimeNG/e455a9cbe0018c68.md



------

#### Components

##### Dashboard main area

Show the main dashboard. 

| Title                                                 |                                                          |                                                      |                                                   |
| ----------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Total threat count line-area high-chart               |                                                          |                                                      |                                                   |
| Top-N Treat names wordcould high-chart                | Top-N Treat actors Pie high-chart                        | Top-N Treat sectors pie  high-chart                  |                                                   |
| sector line-area  high-chart: GOVERNMENT              | sector line-area  high-chart: INFOCOMM                   | sector line-area  high-chart: MANUFACTURING          | sector line-area  high-chart: ENERGY              |
| sector line-area  high-chart: TRANSPORTATION SERVICES | sector line-area  high-chart: HEALTH AND SOCIAL SERVICES | sector line-area  high-chart: SECURITY AND EMERGENCY | sector line-area  high-chart: BANKING AND FINANCE |



```
ng generate component dash-national
```



###### Data fetch query 

Druid SQL(total count) group by hour example: 

```
SELECT
DATE_TRUNC('hour', __time), count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY DATE_TRUNC('hour', __time)
```

Graphql:

```
threatEvents_nationalCount(queryType:"All")
```

Druid SQL(Top-n Sector) group by hour example: 

```
SELECT
threatSector, count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY threatSector
ORDER BY threatCount DESC
LIMIT 10
```

Graphql:

```
threatEvents_nationalTopN(dimension:"threatSector", topN:10)
```



##### Dashboard main area name panel

show a mat-card to display the top N threat name in a highchart word cloud.

```
ng generate component dash-national-name
```

###### Data fetch query

Get top-N threat Name

```
SELECT
threatName, count(*) as threatCount
FROM "ds-suspected-ip-2019"
GROUP BY threatName
ORDER BY threatCount DESC
LIMIT 10
```

Graphql:

```
threatEvents_nationalTopN(dimension:"threatName", topN:5)
```



##### Dashboard main area actor panel 

Show a mat-card to display the top-N threat actors in a highchart pie chart (use can select the N value and whether show legend).Actor:[ThreatName with threatType== 'IntrustionSet']

```
ng generate component dash-national-actor
```

###### Data fetch query

Get top-N threat Name filter by type == 'IntrusionSet'

Druid SQL

```
SELECT
threatName, count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE threatType='IntrusionSet'
GROUP BY threatName
ORDER BY threatCount DESC
LIMIT 10
```

Graphql:

```
threatEvents_nationalTopN(dimension:"threatName", filterDimension:"threatType", filterVal:"IntrusionSet", topN:5)
```



##### Dashboard main area sector panel 

Show a mat-card to display the sectors threat timeseries hour count in a highchart line-area chart.

```
ng generate component dash-national-sector
```

sectors displayed: 

```
["GOVERNMENT", 
"INFOCOMM", 
"MANUFACTURING", 
"ENERGY" 
"TRANSPORTATION SERVICES", 
"HEALTH AND SOCIAL SERVICES",
"SECURITY AND EMERGENCY", 
"BANKING AND FINANCE"];
```

###### Data fetch query 

Get sector threat timeseries count

Druid SQL

```
SELECT
DATE_TRUNC('hour', __time), count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT'
GROUP BY DATE_TRUNC('hour', __time)
ORDER BY DATE_TRUNC('hour', __time)
```

Graphql:

```
threatEvents_nationalCount(queryType:"threatSector",fieldStr:"GOVERNMENT", threatType:"All")
```

filtered by threatType:

```
threatEvents_nationalCount(queryType:"threatSector",fieldStr:"GOVERNMENT", threatType:"Malware", limitVal:1000)
```



##### Dashboard main area pop-up dialog

 Show a pop-up dialog in the mid of the page with a count area chart of the item selected by user on the left side and item description text on the right side.

```
ng generate component dash-national-popup
```

Input: popupName: [<theatName>/<theartSector>]

Input: popupType: ['**Sector**', '**Name**', '**Actor**']

Druid SQL example: 

```
SELECT
DATE_TRUNC('hour', __time), count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE srcSector='GOVERNMENT' and threatType = 'IntrustionSet'
GROUP BY DATE_TRUNC('hour', __time)
ORDER BY DATE_TRUNC('hour', __time)

-----------------------------------
SELECT
DATE_TRUNC('hour', __time), count(*) as threatCount
FROM "ds-suspected-ip-2019"
WHERE threatType='IntrusionSet' and threatName = 'Silence'
GROUP BY DATE_TRUNC('hour', __time)
ORDER BY DATE_TRUNC('hour', __time)

```

Graphql(data):

```
threatEvents_nationalCount(queryType:"threatSector",fieldStr:"GOVERNMENT", threatType:"IntrustionSet", limitVal:1000)
```

Graphql(description)

```
profile_threatName(threatName:"APT37")
```



------

#### Task and Todo list

###### 23/08/2021

- [x] Lean GraphQl, Druid Native queries, use of Insomnia druid client. 
- [x] Build the Nation dashboard main frame/modules. 
- [x] Test higcharts. 

###### 24/08/2021

- [x] 24/08/2021 Fixed the part to fetch data from graphql, 1. Threat Count chart. 
- [x] 25/08/2021 Fixed the part to use native query fetch data from druid, added the  2. Top Threat Names table  and 3. Top Threat Actors (Intrusion Set) chart.
- [x] 29/08/2021 Added the Client threat count display panel.

###### 30/08/2021

**Todo**: Dashboard function panel design

- [x] Threat Count : (Panel UI draft: OK, data fetch query: OK)
- [x] Top Threat Names (Panel UI draft: temporary use `jqxGrid` table, data fetch query: OK)
- [x] Top Threat Actors (Intrusion Set):  (Panel UI draft: temporary use `jqxGrid` table, data fetch query: OK)
- [x] Summary of sectors  (Panel UI draft: Editing, data fetch query: got bug)

###### 31/08/2021

**Todo**: 

- [x] Threat Count : Count and order the data by hours to reduce the loading time.
- [x]  Top Threat Names: changed to use the high-charts word cloud panel.

###### 03/09/2021

**Todo**:

- [x] Top Threat Names panel: Fixed the words layout. 
- [x] Summary of sectors panel: Fix the client's threat panel query error, added the top 3 threat type icon (temporary add at the left bottom). Add the tool tip to show the threat types count for each icon when the use move mouse on it.

###### 05/09/2021

- [x] **Todo**: Fix the detail pop-up dialog when user click the sector panel and and word could click handling popup dialog function.
- [x] Change the line chart area color. 

###### 07/09/2021

- [x] Fixed the popup dialog function for the top-10 Actor Pie chart, data display changed to %.  
- [x] Changed the sector display list table to Pie chart .
- [x] **Todo**:  Add on the pop-up dialog description text display part. 

###### 08/09/2021

- [x] remove the pie chart legends. 
- [x] Add the description in the pop-up dialog. 

- [x] Added the Top-N selection and legend display control for all Top thread name, actor and sector panel.

###### 10/09/2021

**Todo**: change the query part: 

- [x] The query handler threatName,threatActor threatClient etc are all replaced by *threatEvents_nationalCount* and *threatEvents_nationalTopN* in file national.js. the file nationalName.js and nationalActor.js are removed. 
- [x] *threatEvents_nationalCount*: get the hours based timeseries counts of the input threatField. 
- [x] *threatEvents_nationalTopN*: get the top-N name and count of the input threatField.
- [x] The *dash-national-client* components is removed and replace by *dash-national-sector* components.

###### 11/09/2021

- [x] commit the code to gitlab

- [x] Add the code document and remove the un-needed test code. 

###### 13/09/2021

- [x] Fix the code document

###### 15/09/2021

- [x]  **Todo** changes need to do based on the quick review: 
  - replace the query hardcode  "context", 'dataSource', 'intervals' with const in druid.js or passed in parameters. remove the un-needed query parameters. 
  - change the return data field column name ['d0', 'a0'] to ["timestamp","countVal" ] for count query and ['topNKey', 'topNVal'] for top-N query.
  - filtered the "null" top-N key. 
  - Change the main page and popup dialog table layout to p-grid flex layout.







------

> last edited by LiuYuancheng 15/09/2021
