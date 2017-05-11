<% @LANGUAGE="VBSCRIPT"%>
<%
' Sample code: classic-ASP script for reading a persisted set of variables from a Data/userid.text file.
callback = Request.QueryString("callback")
data = "{""student"":""Ben"", ""tutor"":""Steve""}"
Response.Write callback & "(" & data & ")"
%>