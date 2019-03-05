<template>
    <div>
        <div>
                <el-row :inline="true">
                    <el-col :span="6">
                        <el-card class="box-card" style="width:220px">
                            <div @click="getResponse('br')"  id="brClick">
                                <div>
                                    <span style="font-size:12px">问卷浏览量</span>
                                </div>
                                <div style="text-align: center;margin-top:10%">
                                    <span style="font-size:42px;">{{brAmount}}</span><br>
                                    <span style="font-size:10px;color:darkgray">问卷实时访问量</span>
                                </div>
                            </div>
                        </el-card>
                        <el-card class="box-card" style="width:220px">
                            <div @click="getResponse('fb')" id="fbClick">
                                <div>
                                    <span style="font-size:12px">问卷回收量</span>
                                </div>
                                <div style="text-align: center;margin-top:10%">
                                    <span style="font-size:42px;">{{fbAmount}}</span><br>
                                    <span style="font-size:10px;color:darkgray">问卷实时回收量</span>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="18">
                        <div id="surveyResponseChart" style="width:100%;height:330px;"></div>
                    </el-col>
                </el-row>
        </div>

    </div>
</template>

<script>
    import echarts from 'echarts'

    export default{
        props:['BrTimeList','FBTimeList','brAmount','fbAmount'],
        data(){
            return{
                charts: '',
                legendOption:[],
                seriesData:[],
            }
        },
        mounted(){
            window.document.getElementById('brClick').click()
        },
        methods:{
            //得到图形
            getResponse(flag){

                var color=['#37A2DA'];

                var data=[];
                var timeData=[];
                var valueData=[];
                var text="";

                //判断浏览/回收量
                if(flag==='br'){
                    data=this.BrTimeList;
                    text="问卷浏览量"
                }
                else if(flag==='fb'){
                    data=this.FBTimeList;
                    text="问卷回收量"
                }

                if(data.length===0)
                    return;

                for(let line of data){
                    //日期
                    timeData.push(line.surveyTime);
                    //浏览/回收量
                    valueData.push(line.amount);
                }

                this.charts=echarts.init(document.getElementById('surveyResponseChart'));

                this.charts.setOption({
                    color: color,
                    title:{
                        text:text,
                        textStyle:{
                            fontSize: 12
                        }
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            mark : {show: true},
                            dataView : {show: true, readOnly: true},
                            magicType : {show: true, type: ['line', 'bar']},
                            restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : true,
                            data : timeData,
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : [
                        {
                            name:text,
                            type:'line',
                            stack: '总量',
                            itemStyle: {normal: {areaStyle: {type: 'default'}}},
                            data: valueData,
                        }
                    ]
                });
            },
        }
    }
</script>