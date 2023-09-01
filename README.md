# CommandStack<ActionTypeEnum\>

常见的 redo, undo操作. 继承 events.

## Options

处理程序可以是 Promise.

+ rigister?: Record<ActionTypeEnum, handler>
+ mergeRule?: (newActions: Action[], cur: Action, curIndex, otherActions: Action[]) => Actioin[].
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

## 合并操作

合并操作偏业务. 需要根据实际业务场景. 通过创建的时候第二个回调进行合并操作.
