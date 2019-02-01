export function map(list, fn) {
  let newList = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    newList.push(fn(element, index));
  }
  return newList;
}

export function addClass($ele, className) {
  $ele.classList.add(className);
  return $ele;
}

export function removeClass($ele, className) {
  $ele.classList.remove(className);
  return $ele;
}

export function text($ele, content) {
  $ele.textContent = content;
  return $ele;
}

export function html($ele, html) {
  $ele.innerHTML = html;
  return $ele;
}

export function hasClass($ele, className) {
  return $ele.classList.contains(className);
}

export function parent($ele, matchStr) {
  let $currentEle = $ele;
  while ($currentEle.tagName.toLowerCase() !== 'html') {
    if ($currentEle.matches(matchStr)) {
      return $currentEle;
    }
    $currentEle = $currentEle.parentElement;
  }
  return null;
}

export function attr($ele, attrName, attrValue) {
  if (attrValue) {
    $ele.setAttribute(attrName, attrValue);
    return $ele;
  }
  else {
    return $ele.getAttribute(attrName);
  }
}

export function scrollToBottom($ele) {
  let scrollHeight = $ele.scrollHeight;
  let clientHeight = $ele.clientHeight;
  let scrollTop = scrollHeight - clientHeight;
  $ele.scrollTop = scrollTop > 0 ? scrollTop : 0;
}