
let checkPermission = (user, str) => {
    return str.split('\n')
        .map(condition => {

            let field = condition.replace(/\{(.*?)\}.*/gs, '$1'),
                amount = condition.replace(/.*\{(\d+?)\}.*/gs, '$1'),
                comment = condition.replace(/.*\/(.*?)\/.*/gs, '$1');
            let logic = condition.match(/AND|OR|and|or|XOR|<=|>=|<|>|!=|==|&|OR*|!|\|{1,2}/gi)

            if (!field || !amount || !logic) {
                console.error('No or wrong field param. Check mask of string: "{fieldName}>{amount}')
                return null
            }


            if (!user[field]) {
                return {
                    premission: false,
                    comment: comment
                }
            }

            let pram = typeof user[field] === 'number' ? user[field] : user[field].length;

            let check = pram + logic[0] + amount;

            return {
                premission: eval(check),
                comment: comment
            }
        })
}
