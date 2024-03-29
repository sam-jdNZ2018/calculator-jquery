const OP_REG = /[\+\-\×\÷]{1}/;
const SIGN_REG = /[\+\-]{1}/;
const NEG_REG = /[\-]{1}/;
const NON_NEG_REG = /[\+\×\÷]{1}/;

$(document).ready(function() {
  let eq = ""; //The current equation
  let curr = "0"; //What is currently displayed
  let result = ""; //If the equals button has been pressed it will equal the result of the current equal, otherwise nothing

  //Essesntially a reducer determining how button input is handled
  function handleInput(e) {
    let value = e.data.value;
    if (value == "A/C") {
      setCalcState("", "0", "");
    } else if (value == "CE") {
      clearEntry();
    } else if (OP_REG.test(value)) {
      handleOp(value);
    } else if (value == "=") {
      handleEquals(value);
    } else if (value == ".") {
      handleDecimal(value);
    } else {
      handleNum(value);
    }
    $("#eq_display").val(eq);
    $("#display").val(curr);
  }

  function setCalcState(newEq, newCurr, newRes = result) {
    eq = newEq;
    curr = newCurr;
    result = newRes;
  }

  //Clear the previous entry displayed on the screen
  function clearEntry() {
    if (eq.length > 0) {
      //Reset to the initial state if clearing directly after resolving an equation
      if (/[=]{1}/.test(eq)) {
         setCalcState("", "0", "");
      } 
      else if (result == curr && curr == eq) {
        //Remove all of the first number in the equation if that number, used in the current equation, was the result of the previous equation
         setCalcState("", "0", "");
      } 
      else if (result == "" && curr == eq && curr.length == 1) {
        //Reset the program to the initial state if the first item in the equation is deleted and this equation does not use the result of the previous equation
         setCalcState("", "0", "");
      } 
      else if (curr.length > 1) {
        //If the current entry for the equation is a number with more than one digit, remove the one farthest from the right
        eq = eq.slice(0, eq.length - 1);
        curr = curr.slice(0, curr.length - 1);
      } 
      else if (OP_REG.test(curr)) {
        //If the current entry is an operator, the last one must be a number of unknown length
        let i = eq.length - 2;
        let temp = "";
        while (i >= 0 && OP_REG.test(eq[i]) == false) {
          temp = eq[i] + temp;
          i--;
        }
        eq = eq.slice(0, eq.length - 1);
        curr = temp;
      } 
      else {
        //If the current entry is a number, the last one must be an operator
        eq = eq.slice(0, eq.length - 1);
        curr = eq[eq.length - 1];         
      }
    }
  }

  function handleOp(value) {
    let newEq = eq;
    let now = curr;
   if (newEq.length == 0 && !SIGN_REG.test(value)) { //Cannot start an equation with multiplication or division
      newEq = "";
    } 
    //else if (NEG_REG.test(newEq[newEq.length - 1]) && NEG_REG.test(value) && OP_REG.test(newEq[newEq.length - 2]) ) {//Cannot have three operators in a row
       
    //} 
    else if (NEG_REG.test(newEq[newEq.length - 1]) && OP_REG.test(value)) {//Cannot have three operators in a row
      if (OP_REG.test(newEq[newEq.length - 2])) {
        newEq = newEq.slice(0, newEq.length - 2) + value;
      } else if(NEG_REG.test(value)){
        newEq = newEq + value;
        now = value;
      }
      else{
        newEq = newEq.slice(0, newEq.length - 1) + value;
      }
      now = value;
    } 
    else if (OP_REG.test(newEq[newEq.length - 1]) && NON_NEG_REG.test(value)) {//Cannot have two non negative operators in a row
      newEq = newEq.slice(0, newEq.length - 1) + value;
      now = value;
    }     
    else if (result == now) { //If you are using the result of the previous equation in a new equation
      newEq = result  + value;
      now = value;
    } else {
      newEq = newEq + value;
      now = value;
    }
    setCalcState(newEq, now);
  }

  function handleEquals(value) {
    let newEq = eq;
    let now = curr;
    let final = result;
    if (eq.length == 0) {
      //Cannot start an equation with an equals sign
      newEq = "";
    } else if (final != eq && !OP_REG.test(eq[eq.length - 1])) {
      //Can only finish an equation if it is not already finished or the previous button pressed was not an operator
      newEq = newEq + value;
      final = evaluate(newEq);
      newEq = newEq + final;
      now = final;
    }
    setCalcState(newEq, now, final);
  }

  function handleDecimal(value) {
    let newEq = eq + value;
    let now = curr;
    if (eq.length == 0) {
      //If the first button clicked was a decimal, make sure it has a zero in front of it
      newEq = "0.";
      now = newEq;
    } else if (/\./.test(now) || result == now || OP_REG.test(eq[eq.length - 1])) {
      //Cannot click decimal button if the current number already has a decimal, the equation has ended or the last button pressed was an operator
      newEq = eq;
    } else {
      now = now + ".";
    }
    setCalcState(newEq, now);
  }

  function handleNum(value) {
    let newEq = eq + value;
    let now = curr;
    let final = result;
    if (value == "0" && (now == "0" || now == "-0" || now == "+0")) {
      // only allow the first digit in a number to be zero (for decimal numbers)
      newEq = eq;
    } else if (final == now) {
      // Just finished an equation but not using the result in the next equation
      newEq = value;
      now = value;
      final = "";
    } else if (OP_REG.test(now) && now.length != eq.length) {
      //if the previous button clicked was an operator but was not the first button clicked
      now = value;
    } else if ((now == "+0" || now == "-0") && value != "0") {
      // at start of equation do not allow leading zero
      newEq = eq.slice(0, eq.length - 1) + value;
      now = now[0] + value;
    } else if (now == "0" && value != "0") {
      // during equation do not allow leading zeros
      newEq = eq.slice(0, eq.length - 1) + value;
      now = value;
    } else {
      now = now + value;
    }
    setCalcState(newEq, now, final);
  }

  //Return the string representation of the next floating point number in the equation starting from position
  //startPos in the provided text
  function nextNumber(text, startPos) {
    let start = startPos;
    let end = text.length - 1;
    if (NEG_REG.test(text[startPos])) {
      start = start + 1;
    }
    for (let i = start; i < text.length; i++) {
      if (OP_REG.test(text[i]) || text[i] == "=") {
        end = i - 1;
        break;
      }
    }
    return end + 1;
  }

  //Apply an operator to two numbers and return the result
  function evalOp(num1, num2, op) {
    if (op == "+") {
      return num1 + num2;
    } else if (op == "-") {
      return num1 - num2;
    } else if (op == "×") {
      return num1 * num2;
    } else if (op == "÷") {
      return num1 / num2;
    }
    return undefined;
  }

  //Turns the equation the user inputed through the buttons into a resulting number
  function evaluate(value) {
    let total = 0;
    let pos = 0;
    if (SIGN_REG.test(value[0])) {
      pos = nextNumber(value, 1);
      total = parseFloat(value[0] + value.slice(1, pos));
    } else {
      pos = nextNumber(value, 0);
      total = parseFloat(value.slice(0, pos));
    }
    while (value[pos] != "=") {
      let end = nextNumber(value, pos + 1);
      total = evalOp(total, parseFloat(value.slice(pos + 1, end)), value[pos]);
      pos = end;
    }
    //return parseFloat(total.toFixed(4)).toString();
    return total.toString();
  }

  $("#eq_display").val(eq);
  $("#display").val(curr);

  $("#clear").click({ value: "A/C" }, handleInput);
  $("#clear_entry").click({ value: "CE" }, handleInput);
  $("#divide").click({ value: "÷" }, handleInput);
  $("#seven").click({ value: "7" }, handleInput);
  $("#eight").click({ value: "8" }, handleInput);
  $("#nine").click({ value: "9" }, handleInput);
  $("#multiply").click({ value: "×" }, handleInput);
  $("#four").click({ value: "4" }, handleInput);
  $("#five").click({ value: "5" }, handleInput);
  $("#six").click({ value: "6" }, handleInput);
  $("#subtract").click({ value: "-" }, handleInput);
  $("#one").click({ value: "1" }, handleInput);
  $("#two").click({ value: "2" }, handleInput);
  $("#three").click({ value: "3" }, handleInput);
  $("#add").click({ value: "+" }, handleInput);
  $("#zero").click({ value: "0" }, handleInput);
  $("#decimal").click({ value: "." }, handleInput);
  $("#equals").click({ value: "=" }, handleInput);
});
