/**
 * 千位符处理
 * @param {number} num 189000
 * @returns {string} 189,000
 */
export const toThousands = (num) => {
  return (num | 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}

/**
 * 根据公司名字过来公司列表
 * @param {string} val 公司名称，例如厦门或者拼音简写xm
 * @param {array} arr 源数组
 */
export const companyCnFilter = (val, arr = []) => {
  return arr.filter(item => {
    if (item.name.indexOf(val) > -1) {
      return true;
    }
    let spell = item.name.spell('first', 'low');
    if (spell && spell.indexOf(val.toLowerCase()) > -1) {
      return true;
    }
  });
}

export const base64 = (val) => {
  return window.btoa(unescape(encodeURIComponent(val)));
};

export const format = (s, c) => {
  return s.replace(/{(\w+)}/g,
    function (m, p) {
        return c[p];
    });
};

/**
 * 导出excel
 * @param {*} tableid 
 * @param {*} sheetName 
 * @param {*} filename 
 */
export const tableToExcel = (tableid, sheetName = 'worksheet', filename = '导出excel') => {
  var uri = 'data:application/vnd.ms-excel;base64,';
  var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"' +
      'xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
      '<x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets>' +
      '</x:ExcelWorkbook></xml><![endif]-->' +
      '</head><body ><table class="excelTable">{table}</table></body></table>';
  tableid = document.getElementById(tableid);
  var ctx = {
      worksheet: sheetName,
      table: tableid.innerHTML
  };
  let link = document.createElement('a');
  link.href = uri + base64(format(template, ctx));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};