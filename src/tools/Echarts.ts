// y 轴为空的柱状图

export const getBarChartOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['运行值', '预警值', '报警值'],
    top: 10,
    textStyle: {
      fontSize: 14,
      color: '#333'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['冷水机组', '冷冻水泵', '冷却水泵'],
    axisTick: { alignWithLabel: true },
    axisLine: {
      lineStyle: {
        color: '#999'
      }
    },
    axisLabel: {
      fontSize: 14
    }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false }
  },
  series: [
    {
      name: '运行值',
      type: 'bar',
      barGap: 0,
      barWidth: '20%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#3fa7f5' },
            { offset: 1, color: '#72c2ff' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        color: '#333'
      },
      data: [120, 132, 101]
    },
    {
      name: '预警值',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#f5a623' },
            { offset: 1, color: '#fdd282' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        color: '#333'
      },
      data: [220, 182, 191]
    },
    {
      name: '报警值',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#f95b5b' },
            { offset: 1, color: '#fab6b6' }
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        color: '#333'
      },
      data: [150, 232, 201]
    }
  ]
})
