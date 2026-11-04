const padding = count => ' '.repeat(count)

const shift = (value, from, to) => value.split('\n').map((line, index) => {
  if (index === 0) return padding(to) + line
  if (!line.trim()) return ''

  return padding(to) + line.slice(Math.min(from, line.match(/^ */)[0].length))
}).join('\n')

const isJsx = node => node?.type === 'JSXElement' || node?.type === 'JSXFragment'

const jsxLayout = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [],
    messages: { layout: 'Use multiline JSX lists and conditions with consistent indentation.' },
  },
  create(context) {
    const source = context.sourceCode
    const text = node => source.getText(node)
    const render = (node, indent) => shift(text(node), node.loc.start.column, indent)

    return {
      'JSXExpressionContainer:exit'(node) {
        if (node.parent.type === 'JSXAttribute') return

        const expression = node.expression
        const outer = node.loc.start.column
        const inner = outer + 2
        let body

        if (expression.type === 'ConditionalExpression' && (isJsx(expression.consequent) || isJsx(expression.alternate))) {
          body = [
            render(expression.test, inner),
            padding(inner + 2) + '?',
            render(expression.consequent, inner + 2),
            padding(inner + 2) + ':',
            render(expression.alternate, inner + 2),
          ].join('\n')
        } else if (expression.type === 'LogicalExpression' && expression.operator === '&&' && isJsx(expression.right)) {
          body = render(expression.left, inner) + ' &&\n' + render(expression.right, inner)
        } else if (expression.type === 'CallExpression' && expression.callee.type === 'MemberExpression' && expression.callee.property.name === 'map') {
          const callback = expression.arguments[0]

          if (callback?.type !== 'ArrowFunctionExpression') return

          if (isJsx(callback.body)) {
            const prefix = source.text.slice(expression.range[0], callback.body.range[0]).replace(/=>\s*\(?\s*$/, '=>')
            body = shift(prefix, expression.loc.start.column, inner) + '\n' + render(callback.body, inner + 2) + '\n' + padding(inner) + ')'
          } else if (callback.body.type === 'BlockStatement') {
            body = render(expression, inner)
          }
        }

        if (!body) return

        const output = '{\n' + body + '\n' + padding(outer) + '}'

        if (output === text(node)) return

        context.report({ node, messageId: 'layout', fix: fixer => fixer.replaceText(node, output) })
      },
    }
  },
}

const clsxLayout = {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
    messages: { layout: 'Format clsx arguments on separate lines and use objects for conditional classes.' },
  },
  create(context) {
    const source = context.sourceCode
    const text = node => source.getText(node)

    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'clsx' || node.arguments.length < 2) return

        const container = node.parent.type === 'JSXExpressionContainer' ? node.parent : null
        const attribute = container?.parent
        const jsx = attribute?.type === 'JSXAttribute' && attribute.name.name === 'className'
        const line = source.lines[node.loc.start.line - 1]
        const base = jsx ? attribute.loc.start.column + 2 : line.match(/^ */)[0].length
        const argumentsList = []
        let conditions = []
        const flush = () => {
          if (!conditions.length) return

          argumentsList.push({ properties: conditions })
          conditions = []
        }

        for (const argument of node.arguments) {
          if (argument.type === 'LogicalExpression' && argument.operator === '&&' && argument.right.type === 'MemberExpression' && !argument.right.computed && argument.right.object.type === 'Identifier' && argument.right.object.name === 'styles') {
            conditions.push(`[${text(argument.right)}]: ${text(argument.left)}`)
          } else {
            flush()

            if (argument.type === 'ObjectExpression') {
              argumentsList.push({ properties: argument.properties.map(text) })
            } else {
              argumentsList.push({ node: argument })
            }
          }
        }

        flush()
        const lines = argumentsList.map(argument => {
          if (argument.properties) {
            return padding(base + 2) + '{\n' + argument.properties.map(property => padding(base + 4) + property).join(',\n') + '\n' + padding(base + 2) + '}'
          }

          return shift(text(argument.node), argument.node.loc.start.column, base + 2)
        })
        const call = 'clsx(\n' + lines.join(',\n') + '\n' + padding(base) + ')'
        const target = jsx ? container : node
        const output = jsx ? '{\n' + padding(base) + call + '\n' + padding(base - 2) + '}' : call

        if (output === text(target)) return

        context.report({ node: target, messageId: 'layout', fix: fixer => fixer.replaceText(target, output) })
      },
    }
  },
}

export default {
  rules: {
    'jsx-layout': jsxLayout,
    'clsx-layout': clsxLayout,
  },
}
