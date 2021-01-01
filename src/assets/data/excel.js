// 常规合并单元格表头
export const columns = [
  { title: '姓名1', dataIndex: 'userName', width: 150, valueType: 'formula' },
  { title: '部门2', dataIndex: 'deptName', valueType: 'number' },
  { title: '职位3', dataIndex: 'position' },
  {
    title: '专项附加扣除4',
    dataIndex: 'stuffTax',
    children: [
      {
        title: '子女教育',
        dataIndex: 'childrenEv',
      },
      {
        title: '住房补贴',
        dataIndex: 'hourseMoney',
      },
    ],
  },
];
Array.from({ length: 10 }, (...[, v]) => v + 1).forEach((vv) => {
  columns.push({
    title: '工号' + vv,
    dataIndex: 'jobNumber' + vv,
    children: [
      { title: '工号' + vv + '1', dataIndex: 'jobNumber' + vv + '1' },
      { title: '工号' + vv + '2', dataIndex: 'jobNumber' + vv + '2' },
    ],
  });
});
Array.from({ length: 10 }, (...[, v]) => v + 20).forEach((vv) => {
  columns.push({ title: '工号' + vv, dataIndex: 'jobNumber' + vv });
});
columns.push({ title: '备注', dataIndex: 'remark', width: 150 });

// 带筛选排序的表头
export const columns2 = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    fixed: 'left',
    filters: [
      {
        text: 'Joe',
        value: 'Joe',
      },
      {
        text: 'John',
        value: 'John',
      },
    ],
    onFilter: (value, record) => record.name.indexOf(value) === 0,
  },
  {
    title: 'Other',
    children: [
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 150,
        sorter: (a, b) => a.age - b.age,
      },
      {
        title: 'Address',
        children: [
          {
            title: 'Street',
            dataIndex: 'street',
            key: 'street',
            width: 150,
          },
          {
            title: 'Block',
            children: [
              {
                title: 'Building',
                dataIndex: 'building',
                key: 'building',
                width: 100,
              },
              {
                title: 'Door No.',
                dataIndex: 'number',
                key: 'number',
                width: 100,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Company',
    children: [
      {
        title: 'Company Address',
        dataIndex: 'companyAddress',
        key: 'companyAddress',
        width: 200,
      },
      {
        title: 'Company Name',
        dataIndex: 'companyName',
        key: 'companyName',
      },
    ],
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    key: 'gender',
    width: 80,
    fixed: 'right',
  },
];

// 数据
export const dataSource = Array.from({ length: 10000 }, (...[, v]) => v + 1).map((vv) => {
  const tmp = {
    rowKeyIdSp: vv,
  };
  const tmptmp = [];
  columns.forEach((v) => {
    if (v.children) {
      tmptmp.push(...v.children);
    } else {
      tmptmp.push(v);
    }
  });
  tmptmp.forEach((v) => {
    tmp[v.dataIndex] = v.title + '数据' + vv;
  });
  return tmp;
});
