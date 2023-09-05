# CommandStack

常见的 redo, undo操作. 继承 events.

## Quick start

```b
pnpm add @zstark/command-stack
```

```ts
const cs = new CommandStack({ /* handlers */ });

// 记录
cs.dispatch({
    type: 'create.shape',
    context: { /* any */ },
});

// redo undo
cs.redo();
cs.undo();
```

## exmaple

[Live Demo](https://pinghuazhuang.github.io/command-stack/)

```bash
pnpm instsall
pnpm build
pnpm dev
```

## Options

~~处理程序可以是 Promise.~~

+ rigister?: Record<ActionTypeEnum, handler>
+ ~~mergeRule?: (newActions: Action[], cur: Action, curIndex, otherActions: Action[]) => Actioin[].~~
+ ~~debounce?: 是否开启防抖模式.~~
  + @default: true
+ ~~merge?: 是否允许合并操作.~~
  + @default: true

## Methods

+ redo
+ undo
+ excute/emit/dispatch: () => void | Promise<unknow\>
  + 根据选项添加防抖
+ on
+ rigister
+ _handlers
+ _stackIndex: number
+ _stack: Action[]

## Action

```ts
type Action = {
    type: string; // 'delete',
    context: any;
}
```

## TODO

1. handlers 支持异步.
2. ~~合并操作??~~
