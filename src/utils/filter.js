const filter = {
    '1000': function (val) {
        if (typeof (val) === 'number') {
            return (val).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        }
    },
    'companyFilter': function (val) {
        return val.replace(/有限(责任)?公司/g, '').replace(/(股份|网络|技术|科技|信息)/g, '');
    }
}

export default filter