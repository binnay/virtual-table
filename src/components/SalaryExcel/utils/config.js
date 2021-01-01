export const paginationDefault = {
  showSizeChanger: true,
  size: 'small',
  pageSizeOptions: ['30', '50', '100'],
};

export const excelClassName = 'salary-box-box-box';

export const defaultItemWidth = 100;
export const defaultItemHeight = 32;
export const minItemWidth = 50;
export const pdLR = 50;
export const mgTP = 50;
export const mgBT = 50;

export const fixColOptions = [
  {
    value: 'fixPre',
    label: '固定前几列',
    children: [
      { value: 1, label: '一列' },
      { value: 2, label: '二列' },
      { value: 3, label: '三列' },
      { value: -1, label: '取消' },
    ],
  },
  {
    value: 'fixNext',
    label: '固定后几列',
    children: [
      { value: 1, label: '一列' },
      { value: 2, label: '二列' },
      { value: -1, label: '取消' },
    ],
  },
];

export const baseColMenu = [
  { label: '筛选', value: 'filter' },
  { label: '正序', value: 'asc' },
  { label: '倒序', value: 'desc' },
  { label: '删除', value: 'del' },
];
export const extraColMenu = [
  { label: '在前面插入一列', value: 'insertBefore' },
  { label: '在后面插入一列', value: 'insertAfter' },
];
export const typeColMenu = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  {
    label: '人事信息',
    value: 'renshi',
    children: [
      { label: '姓名', value: 'name' },
      { label: '部门', value: 'dept' },
      { label: '职位', value: 'position' },
      { label: '工号', value: 'presonNumId' },
    ],
  },
  {
    label: '固定工资',
    value: 'guding',
    children: [
      { label: '基本工资', value: 'baseMoney' },
      { label: '岗位补贴', value: 'gangweibutie' },
    ],
  },
  {
    label: '考勤',
    value: 'kaoqing',
    children: [
      { label: '应出勤天数', value: 'yingchuqingtianshu' },
      { label: '事假', value: 'shijia' },
      { label: '病假', value: 'bingjia' },
      { label: '入离职缺勤扣除', value: 'rulizhi' },
    ],
  },
  { label: '公式', value: 'formula' },
];
