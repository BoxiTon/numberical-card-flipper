/**
 * [dataMarker 数值翻牌器]
 * 提供数值变化的翻牌效果
 * 提供数值变化的更新效果
 * 
 */
(function($) {

	// 初始化
	var dataMarker = function(element, options) {
		this.element = element;
		this.options = options;

		// 默认参数内容
		this.defaults = {
			start: 100, // 初始数值
			value: 150, // 完成的数值
			len: 6, // 占位的空间，为 0 不进行补位
			isFormatMoney: true, // 是否对数值金额格式化
			effect: "flip", // 几种效果 数值翻页效果
			callback: null, // 结束后回调
			time: 10000 // 执行时间
		}

		// 参数配置
		this.opts = $.extend({}, this.defaults, this.options);
		
		// 记录数值的变化
		this.start = this.opts.start;
		this.value = this.opts.value;
		this.constructStatus = [];

		// 默认模板内容
		this.digitTemplate = '<div class="digit">' +
			'  <div class="digit_top">' +
			'    <span class="digit_wrap"></span>' +
			'  </div>' +
			'  <div class="shadow_top"></div>' +
			'  <div class="digit_bottom">' +
			'    <span class="digit_wrap"></span>' +
			'  </div>' +
			'  <div class="shadow_bottom"></div>' +
			'</div>';

		// 初始化文本
		this.init();

		this.run();

		return this;
	}

	// 构建方法
	dataMarker.prototype = {
		/**
		 * 初始化构建翻页器
		 * 
		 */
		init: function() {
			// 初始化
			var self = this,
				startArr = this.opts.start.toString().split(""),
				startLen = startArr.length,
				placeLen = Math.max(this.opts.value.toString().length, this.opts.start.toString().length, this.opts.len);

			// 构建基础的结构
			for (var i = 0, k = placeLen; i < k; i++) {

				// 是否格式化金额
				if(this.opts.isFormatMoney) {
					// 检测当前为几位数
					if(placeLen > 3 && ((placeLen - i) % 3) == 0) {
						// 检测首位不加符号
						if(i != 0) {
							$('<div class="digit_comma">,</div>').appendTo(this.element);
						}
					}
				}

				// 数值标签
				$('<div class="digit_set ' + ((i == placeLen - 1) ? 'set_last' : '') + '"></div>').appendTo(this.element);
			}

			// 构建 DOM
			this.element.find('.digit_set').each(function(index, item) {

				// 构建 九个数值的 DOM
				for (i = 0; i <= 9; i++) {
					$(item).append(self.digitTemplate);
					$(item).find('.digit').eq(i).find('.digit_wrap').append(i);
				}

				// 初始数值
				if(index > placeLen - startLen -1) {
					$(item).find('.digit').eq(startArr[index - placeLen + startLen]).addClass("active");
				} else {
					$(item).find('.digit').eq(0).addClass("active");
				}
			});
		},
		/**
		 * [run 执行翻页效果]
		 *
		 */
		run: function() {

   			var startArr = this.start.toString().split(""),
   				startLen = startArr.length,
   				valueArr = this.value.toString().split(""),
   				valueLen = valueArr.length,
   				maxLen = Math.max(startLen, valueLen),
   				placeLen = this.element.find('.digit_set').length;

   			var self = this,
   				frequentTime = this.opts.time,
   				frequentCount = 0,
   				increment = (this.value - this.start > 0),
   				flag = true;

   			// 清空构建数据状态
   			this.emptyConstructStatus();

   			// 构建 DOM
			this.element.find('.digit_set').each(function(index, item) {


				// 若站位长度大于终值长度，则不进入数值变化
				if(placeLen - maxLen <= index) {

					// 获取初始值
					var start = placeLen - startLen <= index ? Number(startArr[index - placeLen + startLen]) : 0;
					var end = placeLen - valueLen <= index ? Number(valueArr[index - placeLen + valueLen]) : 0;

					if(start === end && flag) {
						// 构建滚动状态
						self.constructStatus.push({
							index: index,
							item: $(item),
							start: start,
							end: end,
							frequentTime: frequentTime,
							iStopCarousel: true
						});
					} else {

						// 标识初始值与终止值位数不同
						flag = false;
						
						// 递减次数累加
						frequentCount++;

						// 时间递减
						frequentTime = frequentCount > 2 ? 100 : frequentTime/10 - frequentTime/5000;

						// 构建滚动状态
						self.constructStatus.push({
							index: index,
							item: $(item),
							start: start,
							end: end,
							frequentTime: frequentTime,
							iStopCarousel: false
						});

						// 切换动画
						self.flip(index, start, increment);
					}
				} else {
					// 默认滚动状态
					self.constructStatus.push({
						index: index,
						item: $(item),
						start: 0,
						end: 0,
						frequentTime: frequentTime,
						iStopCarousel: true
					});
				}
			});
		},
		/**
		 * [flip 切换效果] 增加的数据
		 *
		 * @param index 当前选项位置
		 * @param count 数值变化值
		 * @param increment 是否递增或递减状态 默认为 false
		 */
		flip: function(index, count, increment) {

			var self = this,
				status = this.constructStatus[index],
				currDigit = status.item;

			// 根据是否增量来判断，是否重置为 0 或 9
			count = increment ? ( count > 9 ? 0 : count) : ( count < 0 ? 9 : count );

			//翻页动画
			var timeCount = setTimeout(function(){
				// 判断当前是否已停止轮播
				if(!status.iStopCarousel) {
					
					switch(index) {
						case 0: 
							if(count === status.end) {
								status.iStopCarousel = true;
								return false;
							} else {
								count = increment ? (count + 1) : (count - 1);
								self.flip(index, count, increment);
							}
							break;
						default: 
							var prevStatus = self.constructStatus[index -1];
							
							if(prevStatus.iStopCarousel) {
								
								if(count === status.end) {
									status.iStopCarousel = true;
									return false;
								} else {
									count = increment ? (count + 1) : (count - 1);
									self.flip(index, count, increment);
								}
							} else {
								count = increment ? (count + 1) : (count - 1);
								self.flip(index, count, increment);
							}
					}
				}

				self.flipEffect(index, count, increment);

				
			}, status.frequentTime);
		},
		/**
		 * 切换效果 DOM 改变
		 * 
		 * @param index 当前选项位置
		 * @param count 数值变化值
		 * @param increment 是否递增或递减状态 默认为 false
		 */
		flipEffect: function(index, count, increment) {

			var status = this.constructStatus[index],
				currDigit = status.item;

			// 递增状态
			if(increment) {

				// 若当前不处于 0 状态
				if (count !== 0) {
					
					// 状态改变
					var current = currDigit.find('.active'),
						previous = currDigit.find('.previous');

					previous.removeClass('previous');
					current.removeClass('active').addClass('previous');

					// 若当前已在位置 "9" 状态
					if (current.next().length == 0) {
						// 重置为 "0" 状态
						currDigit.find('.digit:first-child').addClass('active');
					} else {
						// 下一位的状态
						current.next().addClass('active');
					}
				} else {
					// 标识 "0" 状态
					currDigit.find('.digit:first-child').addClass('active');
				}
			} else {

				// 若当前不处于 0 状态
				if (count !== 9) {
					
					// 状态改变
					var current = currDigit.find('.active'),
						previous = currDigit.find('.previous');

					previous.removeClass('previous');
					current.removeClass('active').addClass('previous');

					// 若当前已在位置 "0" 状态
					if (current.prev().length == 0) {
						// 重置为 "9" 状态
						currDigit.find('.digit:last-child').addClass('active');
					} else {
						// 下一位的状态
						current.prev().addClass('active');
					}
				} else {
					// 标识 "9" 状态
					currDigit.find('.digit:last-child').addClass('active');
				}
			}
		},
		/**
		 * [updateFlip 更新数值变化]
		 *
		 * 考虑动画的切换及增量如何变化
		 * 
		 * @param number 数值
		 */
		updateFlip: function(number) {
			this.start = this.value;
			this.value = number;

			// 执行翻牌器
			this.run();
		},
		/**
		 * [emptyConstructStatus 清空构建状态]
		 * 
		 * @param number 数值
		 */
		emptyConstructStatus: function() {
			this.constructStatus = [];
		},
		/**
		 * [destroy 销毁对象]
		 * 
		 */
		destroy: function() {
			this.element.removeData('dataMarker');
		}

	}

	$.fn.dataMarker = function(options) {
		return this.each(function() {
			if (!$(this).data('dataMarker')) {
				$(this).data('dataMarker', new dataMarker($(this), options));
			}
		});
	};
})(jQuery);