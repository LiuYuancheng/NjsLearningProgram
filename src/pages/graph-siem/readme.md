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



Node selector setup: 

https://dash.plotly.com/cytoscape/styling



jxgrid need to be init after 



sidebar or dialog box to display the table instead of separate tab.

https://www.primefaces.org/primeng/showcase/#/sidebar



##### TODO (02/02/2021): 

For the SubNodes Table:

- [x] Don’t use Geo-GPS as the column name. We don’t have GPS info. Just put the country will do. If no country information just leave the column blank instead of showing “unknown(na,na)”.
- [x] For the Node Geo, just show “Country:” will do. Display country information. If no country info for the selected node then either don’t display the attribute or leave it blank.
- [ ] select edges in the table then high light on the graph
- [ ] Add the graph severity score [0-10] at the left side.

 

Selected Element sidebar:

- [x] The Selected Element sidebar don’t pop In from the right, it covers up the tables. Either show from the bottom or from the left.
- [x] Remove the labels “Selected Element Infromation” and “Node Information”. It’s repetitive not very meaningful.
- [ ] Remove the repeated “Node ID”, “Node Name”, “Node Value”. Just a Node ID will do.
- [ ] Add a mock score under the Node ID attribute. We will explain that corplabs is working on a model to calculate score for each node.
- [ ] The Subgraphs list, just displaying the graph id not very meaningful. Either remove the list or you display table of the subgraph scores and consequences, similar to what you did for the Detailed Node page.

 

For the Node detail Page:

- [x] Remove the “Node Graph” header.
- [x] Make the “Node ID” font bigger. This should replace the “Node Graph” label as the header of the page.
- [x] Add a mock score under the Node ID information. We will explain that corplabs is working on a model to calculate score for each node.
- [ ] Make the bottom table  smaller, maybe around 30% of height.
- [x] For the table on the right, The “Sub-Graph ID” column should be smaller. It’s taking up like 40% of the table space while the Score and Consequences column are squeezed. The Consequence column should be the biggest. Change the “Sub-Graph ID” column name to “Subgraph”.
- [x] The table label “Node[10.1.8.68] Parent Subgraphs Table”, should just put “Subgraph Table” will do.

 

General comments:

- [x] label for subgraphs keep it consistent. I see you calling it “Subgraph”, “SubGraph”, “Sub-Graph”. Standardize all to “Subgraph”.
- [ ] The Consequences column not very readable. Can we show the consequences in list form as tooltip or as detailed row display.







