/**------------------------------------------
 * This is an example of a Angular controller 
 * that handles basic CRUD operation
-------------------------------------------*/
(function() {
'use strict';

angular
	.module('core')
	.controller('ProjectionController', ProjectionController);

ProjectionController.$inject = ['$scope', 'projectionService', '$sce'];

function ProjectionController($scope, projectionService, $sce) {

	var vm = this;	
	vm.data = [];
	vm.projection_levels = ["very poor", "poor", "expected", "good"];
	vm.chances = {
		vPoor:0,
		poor:0,
		expected:0,
		good:0
	}; 

    $scope.$watch('investment', function(newval, oldval) {
			
		renderProjections($scope.investment.risk_level);
		initContent($scope.investment.risk_level);
	}, true);
 
	$(window).resize(function(){

		renderProjections($scope.investment.risk_level);
		initContent($scope.investment.risk_level);
	});

	function initContent (risk_level) { 

		projectionService.getContent(risk_level).then(function(res){
			if(res){
				vm.content = $sce.trustAsHtml(res.description);
			} else{
				vm.content = $sce.trustAsHtml("");
			}
		},function (err){
			toastr.error('Error loading content, please refresh');
		});
	}

	function renderProjections(risk_level){

		projectionService.getChartData(risk_level).then(function(res){

			if(res.length){
				$('.chart-outer').show();
				createHighChart(res);
			} else{
				$('.chart-outer').hide();
			}
			/*vm.data = res;
			var series = calculateSeries($scope.investment.initial_contribution, $scope.investment.horizon, res);
			if(series.length){
				$('#linechart').show();
				renderChart(series);
			} else{
				$('#linechart').hide();
			}*/
		},function (err){
			toastr.error('Error loading content, please refresh');
		});
	}
	
	function fillChances(projection_levels_data){

		vm.chances.vPoor 	 = getRowByProjectionLevel(projection_levels_data, vm.projection_levels[0]).interest_rate;
		vm.chances.poor 	 = getRowByProjectionLevel(projection_levels_data, vm.projection_levels[1]).interest_rate;
		vm.chances.expected = getRowByProjectionLevel(projection_levels_data, vm.projection_levels[2]).interest_rate;
		vm.chances.good 	 = getRowByProjectionLevel(projection_levels_data, vm.projection_levels[3]).interest_rate;
	}
	/*function calculateSeries (amt, horizon, data){

		var o 			= {};
		if(data.length){
			o.years 	= fillYears(horizon);
			o.vPoor 	= fillSeriesData(vm.projection_levels[0], amt, horizon, data);
			o.poor 		= fillSeriesData(vm.projection_levels[1], amt, horizon, data);
			o.expected 	= fillSeriesData(vm.projection_levels[2], amt, horizon, data);
			o.good 		= fillSeriesData(vm.projection_levels[3], amt, horizon, data);
			o = mergeObjAsArr(o);
		}
		return o;
	}
	function mergeObjAsArr(o){
		var arr = [];
		for (var i = 0; i < o.years.length; i++) {
			var t = [];

			var y = moment().add(i,'years').format('YYYY');

			var tooltipHtml = "<div style='padding:5px;min-width:150px'><strong>"
			+"Year: "+y
			+"<br><span style='color:red'>Very Poor $"+ Math.round(o.vPoor[i])+"</span>"
			+"<br><span style='color:silver'>Poor $"+ Math.round(o.poor[i])+"</span>"
			+"<br><span style='color:gold'>Expected $"+ Math.round(o.expected[i])+"</span>"
			+"<br><span style='color:green'>Good $"+ Math.round(o.good[i])+"</span>"
			+"</strong></div>"

			t.push(o.years[i]);
			// t.push(tooltipHtml);
			t.push(Math.round(o.vPoor[i]));
			t.push(Math.round(o.poor[i]));
			t.push(Math.round(o.expected[i]));
			t.push(Math.round(o.good[i]));
			t.push($scope.investment.target_amt);
			t.push(i==1?'Target Value ($'+$scope.investment.target_amt+')':'');
			arr.push(t);
		}
		return arr;
	}
	function renderChart(series){

		google.charts.setOnLoadCallback(drawBasic);
		function drawBasic() {

		    var data = new google.visualization.DataTable();
		    data.addColumn('date', 'Year');
		    // data.addColumn({type:'string',role:'tooltip','p': {'html': true}});
		    data.addColumn('number', 'Very Poor');
		    data.addColumn('number', 'Poor');
		    data.addColumn('number', 'Expected');
		    data.addColumn('number', 'Good');
		    data.addColumn('number', 'Target Value');
		    data.addColumn({type:'string',role:'annotation'});

		    data.addRows(series);

		    var options = {
		    	max:$scope.investment.target_amt+50000,
		      	chartArea:{left:100,right:10,top:50,bottom:50},
		        hAxis: {
		        	title:'TImeframe',
		        },
		        legend:{position:'top'},
		        colors:['red','silver', 'gold', 'green', '#6E8141'],
              	focusTarget:'category',
              	tooltip:{isHtml:true, ignoreBounds:$(window).width()<700? false:true},
		        vAxis: {
		        	title:'Projected Value',
					format:'$#,##,###',
					baselineColor:'#666666',
		        },
	          	seriesType:'line',
	          	series: {
	              	4:{
	              		type:'line',lineDashStyle: [10, 2],lineWidth:1,enableInteractivity: false
	              	}
	          	},
				annotations: {
					style:'none',
					textStyle: {
						bold:true,
					}
				}
	      	};

	      	var chart = new google.visualization.ComboChart(document.getElementById('linechart'));
		    chart.draw(data, options);
		}
	}
	function fillYears(horizon){
		var y = [];
		for (var i = 0; i < horizon; i++) {
			// y.push(i);
			y.push(new Date(moment().add(i,'years').format()));
		}
		return y;
	}*/
	function fillContributionsQuarterly(amt, horizon, monthly_contribution){
		
		var t = [];
		for (var i = 0; i <= (parseInt(horizon)*4)+1; i++) {
			var a = [];
			a.push(parseInt(moment(getTimestampToday()).add(i*3,'months').format('x')));
			a.push(parseFloat(amt));
			t.push(a);
			amt = Math.round(parseInt(amt) + ((parseInt(monthly_contribution)*12)/4));
		}
		return t;
	}
	function fillContributions(amt, horizon, monthly_contribution){

		if(horizon<4){
			return fillContributionsQuarterly(amt, horizon, monthly_contribution);
		}		
		var t = [];
		for (var i = 0; i <= parseInt(horizon)+1; i++) {
			var a = [];
			a.push(parseInt(moment(getTimestampToday()).add(i,'years').format('x')));
			a.push(parseFloat(amt));
			t.push(a);
			amt = parseInt(amt) + parseInt(monthly_contribution)*12;
		}
		return t;
	}
	function fillSeriesDataQuarterly (projection_level, amt, horizon, data, monthly_contribution){

		var row = getRowByProjectionLevel(data, projection_level);
		var t = [];
		for (var i = 0; i <= (parseInt(horizon)*4)+1; i++) {
			var a = [];
			a.push(parseInt(moment(getTimestampToday()).add(i*3,'months').format('x')));
			a.push(parseFloat(amt));
			t.push(a);
			amt = getAmtWithInterestAdded(parseFloat(amt)+(parseFloat(monthly_contribution)*3), parseFloat(row.interest_rate)/4);
		}
		return t;
	}
	function fillSeriesData (projection_level, amt, horizon, data, monthly_contribution){

		if(horizon<4){
			return fillSeriesDataQuarterly(projection_level, amt, horizon, data, monthly_contribution);
		}
		var row = getRowByProjectionLevel(data, projection_level);
		var t = [];
		for (var i = 0; i <= parseInt(horizon)+1; i++) {
			var a = [];
			a.push(parseInt(moment(getTimestampToday()).add(i,'years').format('x')));
			a.push(parseFloat(amt));
			t.push(a);
			amt = getAmtWithInterestAdded(parseFloat(amt)+(parseFloat(monthly_contribution)*12), row.interest_rate);
		}
		return t;
	}
	function getAmtWithInterestAdded(amt, interest_rate){
		return Math.round(parseFloat(amt) + parseFloat(((parseFloat(amt)*parseFloat(interest_rate))/100)));
	}
	function getRowByProjectionLevel(arr, level){

		var tmp = null;
		angular.forEach(arr, function (v, i){

			if(v.projection_level==level){

				tmp = v;
			}
		});
		return tmp;
	}

	function createHighChart(projection_levels_data){
	
		fillChances(projection_levels_data);
		var chartData = getChartData(projection_levels_data);
		console.log(chartData);
		$(function () {
		    $('#linehighchart').highcharts({
		        chart: {
		          	type: 'area',
		          	alignTicks: false,
		          	height: 350,
		          	backgroundColor: '#fbfbfb',
    				marginRight: 70,
    				marginTop: 20,
		          	spacing: [0, 0, 0, 0]
		        },
 				exporting: {enabled: false} ,
				credits: {enabled: false},
		        legend:{enabled: false},
		        title: { text: ''},
		        xAxis: {
		            type:'datetime',
		          	maxPadding: 0,
		            lineColor:'#bcbcbc',
			        title: {
			            text: 'Timeframe'
			        },
					plotLines: [
						{
						    color: '#6E8141',
						    dashStyle: 'LongDash',
						    value: moment().add($scope.investment.horizon, 'years'),
						    width: 1,
						    zIndex:6,
					        label: {
					          text: "<strong>" + moment().add($scope.investment.horizon,'years').format('MMMM, YYYY') + "</strong> <br /> Target Date",
					          style: {
					            fontWeight: 'normal',
					            color: '#6E8141',
					            textShadow: '1px 1px 1px #fff'
					          }
					        }
						}
					],
					plotBands: [{
					    color: 'rgba(244,244,244,0.5)',
					    zIndex:5,
					    fillOpacity:0.5,
					    from: moment().add($scope.investment.horizon, 'years'),
					    to: moment().add(parseInt($scope.investment.horizon)+1, 'years')
					}],
		        },
		        yAxis: {
		            title: {
		                text: 'Projected Value'
		            },
		            lineColor:'#bcbcbc',
		          	gridLineWidth: 0,
		            lineWidth: 1,
		          	opposite: true,
		          	labels: {
			            formatter: function() {
			              return '$' + this.value / 1000 + 'k';
			            }
			        },
		          	max: $scope.investment.target_amt>chartData.series.good[chartData.series.good.length-1][1]?$scope.investment.target_amt:chartData.series.good[chartData.series.good.length-1][1],
					plotLines: [
						{
						    color: '#6E8141',
						    dashStyle: 'LongDash',
						    value: $scope.investment.target_amt,
						    width: 1,
						    zIndex:6,
					        label: {
					          text: "<strong> $" + Highcharts.numberFormat($scope.investment.target_amt,'','',',') + "</strong> <br /> Target Value",
					          style: {
					            fontWeight: 'bold',
					            color: '#6E8141',
					            textShadow: '1px 1px 1px #fff'
					          }
					        }
						}
					],
		        },
		        tooltip: {
		          	crosshairs: [
			            {
			              zIndex: 9999,
			              zIndex: 9999
			            }
		          	],
			        shared: true,
    				formatter: function() {
						var s = [];
            			s.push('<strong>' + Highcharts.dateFormat('%B, %Y', this.points[0].x) + '</strong><br>');
			            $.each(this.points, function(i, point) {
			                s.push(
			                	'<span style="color:'+point.color+';font-weight:bold;">'+ point.series.name +' : $'
			                	+ Highcharts.numberFormat(point.y ,'','',',')
			                    +'<span><br>'
		                    );
			            });
			            return s.join('');
		          	}
		        },
		        plotOptions: {
		          	area: {
			            zIndex: 60,
			            lineWidth: 0,
			            marker: {
			              	enabled: false,
			              	fillOpacity: 1,
			              	symbol: 'circle',
			              	radius: 4,
	              			fillColor: '#FFF'
			            }
		          	},
			        scatter: {
			            zIndex: 60,
			            enableMouseTracking: false,
			            marker: {
			              	symbol: 'circle',
			              	radius: 20,
			              	lineWidth: 3,
			              	lineColor: '#6E8141',
			              	states: {
			                	hover: {
			                  	enabled: true,
			                  	radius: 18,
			                  	lineWidth: 2
			                }
			              }
			            }
			        },
		        },
		        series: [
			        {
			            id: 'good',
			            name: 'Good',
			            zIndex:1,
            			color: '#FFCA64',
			            data: chartData.series.good,
			            states: {
			              	hover: {
			                	enabled: false
			              	}
			            }
		        	},
			        {
			            id: 'expected',
			            name: 'Expected',
			            zIndex:2,
            			color: '#70B7BA',
			            data: chartData.series.expected,
			        }, 
			        {
			            id: 'poor',
			            name: 'Poor',
			            zIndex:3,
            			color: '#fd6d83',
			            data: chartData.series.poor,
			            states: {
			              	hover: {
			                	enabled: false
			              	}
			            }
			        }, 	
			        {
			            id: 'very_poor',
			            name: 'Very Poor',
			            data: chartData.series.vPoor,
			            fillColor: '#fbfbfb',
			            zIndex:4,
			            lineWidth: 3,
            			color: '#E62F49	',
			        },
			        {
			            id: 'contributions',
			            name: 'Contributions Only',
			            data: chartData.series.contributions,
			            type:'line',
			            zIndex:4,
			            lineWidth: 2,
            			color: '#6E8141',
            			marker: {
			              	enabled: false,
						},
			            states: {
			              	hover: {
			                	enabled: false
			              	}
			            }
			        },
			        {
			            id: 'target_circle',
			            name: "target_circle",
			            color: 'rgba(145, 220, 255, 0.5)',
			            type: "scatter",
			            data: [[ parseInt(moment().add($scope.investment.horizon,'years').format('x')), $scope.investment.target_amt]]
			        }
		        ]
		    });
		});	
	}
	function getTimestampToday(){
		return parseInt(moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').format('x'));
	}
	function getTimestampAfter(years){
		return parseInt(moment(getTimestampToday()).add(years, 'years').format('x'));
	}
	function getChartData (projection_levels_data){

		var chartData 		= {};
		chartData.startDate = getTimestampToday();
		chartData.endDate  	= getTimestampAfter(parseInt($scope.investment.horizon)+1);
		chartData.series 	= calculateSeries ($scope.investment.initial_contribution, $scope.investment.horizon, projection_levels_data, $scope.investment.monthly_contribution);
		return chartData;
	}

	function calculateSeries (amt, horizon, data, monthly_contribution){

		var o 				= {};
		if(data.length){
			o.vPoor 		= fillSeriesData(vm.projection_levels[0], amt, horizon, data, monthly_contribution);
			o.poor 			= fillSeriesData(vm.projection_levels[1], amt, horizon, data, monthly_contribution);
			o.expected 		= fillSeriesData(vm.projection_levels[2], amt, horizon, data, monthly_contribution);
			o.good 			= fillSeriesData(vm.projection_levels[3], amt, horizon, data, monthly_contribution);
			o.contributions = fillContributions(amt, horizon, monthly_contribution);
		}
		return o;
	}
}
})();
