<template>
    <div>
        <div>
            <el-button-group>
                <el-button size="small" type="primary" plain  @click="GetChart('analysisChart','pie',theme)" id="btnPie">饼状图</el-button>
                <el-button size="small" type="success" plain @click="GetChart('analysisChart','bar',theme)">柱状图</el-button>
                <el-button size="small" type="info" plain @click="GetChart('analysisChart','stripe',theme)">条形图</el-button>
                <el-button size="small" type="warning" plain @click="GetChart('analysisChart','line',theme)">折线图</el-button>
            </el-button-group>

            <!--<el-radio-group v-model="radio" style="margin-left: 10%" size="small">-->
                <!--<el-radio-button label="light">浅色系</el-radio-button>-->
                <!--<el-radio-button label="dark">深色系</el-radio-button>-->
            <!--</el-radio-group>-->

        </div>
        <div style="margin-top:1%">
            <div id="analysisChart" style="width:500px; height: 300px" ></div>
        </div>
    </div>
</template>

<script>
    import echarts from 'echarts'

    export default {
        props:['LangOption','SeriesData'],
        data(){
            return{
                charts: '',
                legendOption:[],
                seriesData:[],

                colorLight:['#37A2DA', '#32C5E9','#29FF10', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
                //colorDark:['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3' ],

                radio:'light',

            }
        },
        computed:{
            theme:function () {
                return this.radio;
            }
        },
        mounted(){
            window.document.getElementById('btnPie').focus();
            window.document.getElementById('btnPie').click();
        },
        methods:{
            //生成图形
            GetChart(id,chartType,theme){

                this.legendOption= this.LangOption;
                this.seriesData=this.SeriesData;

                this.charts=echarts.init(document.getElementById(id));

                var tooltip;
                var grid;
                var legend={orient:'vertical', right:true, data:this.legendOption};

                var series=[];
                var xAxis=[];
                var yAxis=[];
                var color=[];
                color=this.colorLight;

                // if(theme==='light')
                //     color=this.colorLight;
                // else if(theme==='dark')
                //     color=this.colorDark;

                if(chartType==='pie'){
                    xAxis=[{
                        show:false
                    }];
                    yAxis=[{
                       show:false
                    }];
                    series=[{
                        name:'问卷调研',
                        type:'pie',
                        radius:'55%',
                        center: ['40%', '50%'],
                        data:this.seriesData
                    }];
                    tooltip={ trigger:'item', formatter:'{a}<br>{b}:{c} ({d}%)'}
                } else if(chartType==='line'|| chartType==='bar'){
                        xAxis=[{
                            type:'category',
                            //boundaryGap: false,
                            data:this.legendOption,
                            show:true
                        }];
                        yAxis=[{
                            type: 'value',
                            show:true
                        }];
                        series=[{
                            name:'问卷调研',
                            data: this.seriesData,
                            type: chartType,
                            areaStyle: {}
                        }];
                        tooltip={ trigger:'item', formatter:'{a}<br>{b}:{c}'};
                     } else if(chartType==='stripe'){
                        grid = {top: 80, bottom: 30};
                        xAxis={ type : 'value',
                            position: 'top',
                            splitLine: {lineStyle:{type:'dashed'}},
                            show:true
                        };
                        yAxis= {type : 'category',
                            axisLine: {show: false},
                            axisLabel: {show: true}, axisTick: {show: false},
                            splitLine: {show: false},
                            data:this.legendOption,
                            show:true
                        };
                        series=[{
                            name:'问卷调研',
                            data: this.seriesData,
                            type: 'bar',
                            areaStyle: {}
                        }];
                        tooltip={ trigger:'item', formatter:'{a}<br>{b}:{c}'};
                    }

                    this.charts.setOption({
                        color: color,
                        tooltip: tooltip,
                        xAxis:xAxis,
                        yAxis:yAxis,
                        legend:legend,
                        series:series,
                        grid:grid,
                    });

            },
        }
    }
</script>