abstract class AVisibleObserve {
  // 监听元素的dom id
  protected targetDomId: string

  // 可见返回根节点dom id
  protected rootDomId?: string

  // active变化的回调
  protected onActiveChange: (active?: boolean) => void

  constructor(targetDomId: string, onActiveChange: (active?: boolean) => void, rootDomId?: string) {
    this.targetDomId = targetDomId
    this.rootDomId = rootDomId
    this.onActiveChange = onActiveChange
  }

  /**
   * 启动监听
   */
  abstract observe(): void

  /**
   * 取消监听
   */
  abstract unObserve(): void
}

export class IntersectionVisibleObserve extends AVisibleObserve {
  /**
   * IntersectionObserver 实例
   */
  private intersectionObserver: IntersectionObserver

  constructor(targetDomId: string, onActiveChange: (active?: boolean) => void, rootDomId?: string) {
    super(targetDomId, onActiveChange, rootDomId)
    this.intersectionObserver = new IntersectionObserver(
      (changes) => {
        console.log(changes)
        // 目标元素在根元素范围内（目标元素可见）
        if (changes[0].intersectionRatio > 0) {
          onActiveChange(true)
        } else {
          // 目标元素不可见
          onActiveChange(false)
          // 因为虚拟DOM更新导致实际DOM更新，也会在此触发，判断DOM丢失则重新监听
          const { target } = changes[0]
          if (!document.body.contains(target)) {
            this.intersectionObserver.unobserve(target)
            // 重新监听
            this.observe()
          }
        }
      },
      {
        root: rootDomId ? document.querySelector(rootDomId) : null, // 所监听对象的具体祖先元素。如果未传入值或值为null，则默认使用顶级文档的视窗。
      },
    )
  }

  observe() {
    const targetDom = document.querySelector(this.targetDomId)
    if (targetDom) {
      this.intersectionObserver.observe(targetDom)
    }
  }

  unObserve() {
    this.intersectionObserver.disconnect()
  }
}

export class SetIntervalVisibleObserve extends AVisibleObserve {
  // interval引用
  private interval!: NodeJS.Timeout

  // 检查是否可见的时间间隔
  private checkInterval = 1000

  // 判断是否可见
  private judgeActive() {
    // 获取根DOM元素
    if (this.rootDomId) {
      const rootDom = document.querySelector(this.rootDomId)
      if (!rootDom) {
        return
      }
      // 获取根DOM元素的rect
      const rootDomBoundce = rootDom.getBoundingClientRect()
    }
    // 获取当前元素的rect
    const targetDom = document.querySelector(this.targetDomId)
    if (!targetDom) {
      return
    }
    const targetDomBoundce = targetDom.getBoundingClientRect()
    // 判断当前元素是否在根元素的可见范围内
  }

  observe() {
    this.judgeActive()
    this.interval = setInterval(this.judgeActive, this.checkInterval)
  }

  unObserve() {
    clearInterval(this.interval)
  }
}

/**
 * 监听元素是否可见总类
 */
export class VisibleObserve extends AVisibleObserve {
  // 实际VisibleObserve类
  private actualVisibleObserve: AVisibleObserve

  constructor(targetDomId: string, onActiveChange: (active?: boolean) => void, rootDomId?: string) {
    super(targetDomId, onActiveChange, rootDomId)
    // 根据浏览器 API 兼容程度选用不同 Observe 方案
    if ('IntersectionObserver' in window) {
      // 最新 IntersectionObserve 方案
      this.actualVisibleObserve = new IntersectionVisibleObserve(targetDomId, onActiveChange, rootDomId)
    } else {
      // 兼容的 SetInterval 方案
      this.actualVisibleObserve = new SetIntervalVisibleObserve(targetDomId, onActiveChange, rootDomId)
    }
  }

  observe() {
    this.actualVisibleObserve.observe()
  }

  unObserve() {
    this.actualVisibleObserve.unObserve()
  }
}
