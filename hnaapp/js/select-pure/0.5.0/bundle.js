var SelectPure = function () {
  "use strict";
  const e = {
    value: "data-value",
    disabled: "data-disabled",
    class: "class",
    type: "type"
  };
  class t {
    constructor(e, t = {}, s = {}) {
      return this._node = e instanceof HTMLElement ? e : document.createElement(e), this._config = {
        i18n: s
      }, this._setAttributes(t), t.textContent && this._setTextContent(t.textContent), this
    }
    get() {
      return this._node
    }
    append(e) {
      return this._node.appendChild(e), this
    }
    addClass(e) {
      return this._node.classList.add(e), this
    }
    removeClass(e) {
      return this._node.classList.remove(e), this
    }
    toggleClass(e) {
      return this._node.classList.toggle(e), this
    }
    addEventListener(e, t) {
      return this._node.addEventListener(e, t), this
    }
    removeEventListener(e, t) {
      return this._node.removeEventListener(e, t), this
    }
    setText(e) {
      return this._setTextContent(e), this
    }
    getHeight() {
      return window.getComputedStyle(this._node).height
    }
    setTop(e) {
      return this._node.style.top = `${e}px`, this
    }
    focus() {
      return this._node.focus(), this
    }
    _setTextContent(e) {
      this._node.textContent = e
    }
    _setAttributes(t) {
      for (const s in t) e[s] && t[s] && this._setAttribute(e[s], t[s])
    }
    _setAttribute(e, t) {
      this._node.setAttribute(e, t)
    }
  }
  var s = Object.assign || function (e) {
    for (var t = 1; t < arguments.length; t++) {
      var s = arguments[t];
      for (var i in s) Object.prototype.hasOwnProperty.call(s, i) && (e[i] = s[i])
    }
    return e
  };
  const i = {
    select: "select-pure__select",
    dropdownShown: "select-pure__select--opened",
    multiselect: "select-pure__select--multiple",
    label: "select-pure__label",
    placeholder: "select-pure__placeholder",
    dropdown: "select-pure__options",
    option: "select-pure__option",
    autocompleteInput: "select-pure__autocomplete",
    selectedLabel: "select-pure__selected-label",
    selectedOption: "select-pure__option--selected",
    placeholderHidden: "select-pure__placeholder--hidden",
    optionHidden: "select-pure__option--hidden"
  };
  return class {
    constructor(e, n) {
      this._config = s({}, n, {
        classNames: s({}, i, n.classNames)
      }), this._state = {
        opened: !1
      }, this._icons = [], this._boundHandleClick = this._handleClick.bind(this), this._boundUnselectOption = this._unselectOption.bind(this), this._boundSortOptions = this._sortOptions.bind(this), this._body = new t(document.body), this._create(e), this._config.value && this._setValue()
    }
    value() {
      return this._config.value
    }
    reset() {
      this._config.value = this._config.multiple ? [] : null, this._setValue()
    }
    _create(e) {
      const s = "string" == typeof e ? document.querySelector(e) : e;
      this._parent = new t(s), this._select = new t("div", {
        class: this._config.classNames.select
      }), this._label = new t("span", {
        class: this._config.classNames.label
      }), this._optionsWrapper = new t("div", {
        class: this._config.classNames.dropdown
      }), this._config.multiple && this._select.addClass(this._config.classNames.multiselect), this._options = this._generateOptions(), this._select.addEventListener("click", this._boundHandleClick), this._select.append(this._label.get()), this._select.append(this._optionsWrapper.get()), this._parent.append(this._select.get()), this._placeholder = new t("span", {
        class: this._config.classNames.placeholder,
        textContent: this._config.placeholder
      }), this._select.append(this._placeholder.get())
    }
    _generateOptions() {
      return this._config.autocomplete && (this._autocomplete = new t("input", {
        class: this._config.classNames.autocompleteInput,
        type: "text"
      }), this._autocomplete.addEventListener("input", this._boundSortOptions), this._optionsWrapper.append(this._autocomplete.get())), this._config.options.map(e => {
        const s = new t("div", {
          class: this._config.classNames.option,
          value: e.value,
          textContent: e.label,
          disabled: e.disabled
        });
        return this._optionsWrapper.append(s.get()), s
      })
    }
    _handleClick(e) {
      if (e.stopPropagation(), e.target.className !== this._config.classNames.autocompleteInput) {
        if (this._state.opened) {
          const t = this._options.find(t => t.get() === e.target);
          return t && this._setValue(t.get().getAttribute("data-value"), !0), this._select.removeClass(this._config.classNames.dropdownShown), this._body.removeEventListener("click", this._boundHandleClick), this._select.addEventListener("click", this._boundHandleClick), void(this._state.opened = !1)
        }
        e.target.className !== this._config.icon && (this._select.addClass(this._config.classNames.dropdownShown), this._body.addEventListener("click", this._boundHandleClick), this._select.removeEventListener("click", this._boundHandleClick), this._state.opened = !0, this._autocomplete && this._autocomplete.focus())
      }
    }
    _setValue(e, t, s) {
      if (e && !s && (this._config.value = this._config.multiple ? [...this._config.value || [], e] : e), e && s && (this._config.value = e), this._options.forEach(e => {
          e.removeClass(this._config.classNames.selectedOption)
        }), this._placeholder.removeClass(this._config.classNames.placeholderHidden), this._config.multiple) {
        const e = this._config.value.map(e => {
          const t = this._config.options.find(t => t.value === e);
          return this._options.find(e => e.get().getAttribute("data-value") === t.value.toString()).addClass(this._config.classNames.selectedOption), t
        });
        return e.length && this._placeholder.addClass(this._config.classNames.placeholderHidden), void this._selectOptions(e, t)
      }
      const i = this._config.value ? this._config.options.find(e => e.value.toString() === this._config.value) : this._config.options[0],
        n = this._options.find(e => e.get().getAttribute("data-value") === i.value.toString());
      this._config.value ? (n.addClass(this._config.classNames.selectedOption), this._placeholder.addClass(this._config.classNames.placeholderHidden), this._selectOption(i, t)) : this._label.setText("")
    }
    _selectOption(e, t) {
      this._selectedOption = e, this._label.setText(e.label), this._config.onChange && t && this._config.onChange(e.value)
    }
    _selectOptions(e, s) {
      this._label.setText(""), this._icons = e.map(e => {
        const s = new t("span", {
            class: this._config.classNames.selectedLabel,
            textContent: e.label
          }),
          i = new t(this._config.inlineIcon ? this._config.inlineIcon.cloneNode(!0) : "i", {
            class: this._config.icon,
            value: e.value
          });
        return i.addEventListener("click", this._boundUnselectOption), s.append(i.get()), this._label.append(s.get()), i.get()
      }), s && this._optionsWrapper.setTop(Number(this._select.getHeight().split("px")[0]) + 5), this._config.onChange && s && this._config.onChange(this._config.value)
    }
    _unselectOption(e) {
      const t = [...this._config.value],
        s = t.indexOf(e.target.getAttribute("data-value")); - 1 !== s && t.splice(s, 1), this._setValue(t, !0, !0)
    }
    _sortOptions(e) {
      this._options.forEach(t => {
        t.get().textContent.toLowerCase().startsWith(e.target.value.toLowerCase()) ? t.removeClass(this._config.classNames.optionHidden) : t.addClass(this._config.classNames.optionHidden)
      })
    }
  }
}();
