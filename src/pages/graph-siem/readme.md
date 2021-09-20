





Flex layout exmaple: 

https://livebook.manning.com/book/angular-development-with-typescript-second-edition/chapter-7/39

Html display if-else: 

https://malcoded.com/posts/angular-ngif-else/

cytocapte.Js API: 

https://js.cytoscape.org/#ele.isEdge



call parent function from child: 

https://stackblitz.com/edit/calling-parent-function-from-child-component?file=src%2Fapp%2Fparent-component%2Fparent-component.component.html

how to pass value in parent funcion:

 <app-cytoscape #cygraph (parentFun)="parentFun($event)"></app-cytoscape>

color set: 

https://coolors.co/palettes/trending

Node selector setup: 

https://dash.plotly.com/cytoscape/styling



jxgrid need to be init after 



sidebar or dialog box to display the table instead of separate tab.

https://www.primefaces.org/primeng/showcase/#/sidebar

Text icon generator: 

https://cooltext.com/Logo-Design-Simple





##### TODO (02/08/2021): 

###### Landing Page: 

Subgraph display: 

- [x] Change the graph style to same as the threat hunting graph. 
- [x] Change the none IP node's(program) Icon.
- [x] Show selected node/edge detail information under the 



Subgraph Info area

- [x] Add the graph severity score [0-10] at the left side.

- [x] Layout the subgraph consequences info with table.

  

Selected Element sidebar:

- [x] Change the sidebar display to show the node/edge information under the subgraph info area. 
- [x] Remove the labels “Selected Element Information” and “Node Information”. 
- [x] Remove the repeated “Node ID”, “Node Name”, “Node Value”. Just a Node ID will do.
- [x] Add a mock score under the Node ID attribute. We will explain that corplabs is working on a model to calculate score for each node.
- [ ] The Subgraphs list, just displaying the graph id not very meaningful. Either remove the list or you display table of the subgraph scores and consequences, similar to what you did for the Detailed Node page. [need to decide remove the info or add scores and consequences] 



Subgraph select table:

- [x] Add dropdown detail and show the consequences detail when user click the row drop down menu. 



 Subgraphs nodes Table:

- [x] Remove GPS position info, Just put the country. If no country information just leave the column blank instead of showing “unknown(na,na)”.
- [ ] For the Node Geo, just show “Country:” will do. Display country information. If no country info for the selected node then either don’t display the attribute or leave it blank. [got a small bug]
- [ ] select edges in the table then high light on the graph (editing)

Subgraph edges Table: 

- [x] Show  3 columns: src, target and signature in the table. (The other columns hide behind)
- [x] span second value convert unit from sec to day. 
- [x]  Add dropdown detail and show the edges detail when user click the row drop down menu. 



###### Node detail Page:

Node graph display: 

- [x] Remove the “Node Graph” header.
- [x] Change the none IP node's(program) Icon.
- [x] Change the graph style to same as the threat hunting graph.
- [x] Make the “Node ID” font bigger. This should replace the “Node Graph” label as the header of the page.
- [x] Add a mock score under the Node ID information. We will explain that corplabs is working on a model to calculate score for each node.



Related node  table:

- [x] Make the bottom table  smaller, maybe around 30% of height.
- [x] Add mock score column. 



Subgraph table

- [x] For the table on the right, The “Sub-Graph ID” column should be smaller. It’s taking up like 40% of the table space while the Score and Consequences column are squeezed. The Consequence column should be the biggest. Change the “Sub-Graph ID” column name to “Subgraph”.
- [x] The table label “Node[10.1.8.68] Parent Subgraphs Table”, should just put “Subgraph Table” will do.
- [x] Add dropdown detail and show the consequences detail when user click the row drop down menu.

 

Display control

- [x] Added the display control for toggle displayed edges label. 



###### General comments:

- [x] label for subgraphs keep it consistent. I see you calling it “Subgraph”, “SubGraph”, “Sub-Graph”. Standardize all to “Subgraph”.
- [x] The Consequences column not very readable. Can we show the consequences in list form as tooltip or as detailed row display.



##### TODO (04/08/2021): 

1. Introduce the function of each area of the dashboard. 

2. Show the log data set selection area. 
3. Show "snort" data subgraph G1. 
4. (optional) Show 'snort' data subgraph G13 and filter by node ID "172.16.0.110"
5. Show Fortinet data G2. 
6. Show Fortinet data G0 -> focus  column Signarure -> column Num of Events - > column "Dispersion" 
7. Switch to snort data -> show subgraph filter with IP 172.16.0.116
8. Switch to linked data -> show subgraph G2. 

