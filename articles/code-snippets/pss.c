%{
#include<string.h>
#include<iostream>
#include<stdbool.h>
#include "y.tab.h"

#define RETURN_IF_INVALID(x)\
do{\
	int _ret = (x);\
	if(_ret!=-1)\
		return _ret;\
}while(0)


char id_buffer[256]= "\0";
bool commented = false;

int is_keyword(){
	if(strcmp(yytext,"extends")==0) {return EXTENDS;}
	if(strcmp(yytext,"alias")==0) {return ALIAS;}
	return -1;
}
int parse_comment(){
	if(commented){
		yylval.string = strdup(yytext); 
		//std::cout<< "comment detected was "<<yytext;
		return COMMENT;
	}
	return -1;
}

int yylex(void);
%}

IDENTIFIER [A-Za-z_]+[A-Za-z_0-9]*
WHITESPACE [ \t\n]
COMMENT_BEGIN "/*"
COMMENT_END "*/"

%x property
%option noyywrap

%%
\{      				{ RETURN_IF_INVALID(parse_comment()); return OPENING_BRACES;}
\}      				{ RETURN_IF_INVALID(parse_comment()); return CLOSING_BRACES;}
{IDENTIFIER}(-[A-Za-z_0-9]+)*/{WHITESPACE}*: 		{ RETURN_IF_INVALID(parse_comment());yylval.string = strdup(yytext);return PROPERTY_NAME;}
{IDENTIFIER}		{ 
					RETURN_IF_INVALID(parse_comment());
					int keyword = is_keyword();
					if(keyword != -1) {return keyword;}
					else { 
						yylval.string = strdup(yytext);
						return IDENTIFIER;
					}
					/*this idiom up above works for 'anything else a.k.a .*'*/
					}
\.{IDENTIFIER}(-[A-Za-z_0-9]+)* 	{ RETURN_IF_INVALID(parse_comment()); yylval.string = strdup(yytext);return CLASS_NAME;}
{COMMENT_BEGIN}				{ commented=true; printf("\n");	ECHO; }
{COMMENT_END}				{ commented=false;		ECHO; }
;					{ RETURN_IF_INVALID(parse_comment()); return PROPERTY_SEPARATOR; }
\[					{ RETURN_IF_INVALID(parse_comment()); return OPENING_BRACES; }
\]					{ RETURN_IF_INVALID(parse_comment()); return CLOSING_BRACES; }
:					{ RETURN_IF_INVALID(parse_comment()); return PAIR_SEPARATOR; }
{WHITESPACE} 				{ RETURN_IF_INVALID(parse_comment()); return WHITESPACE;}
= 					{ RETURN_IF_INVALID(parse_comment()); return ASSIGN;}
\$ 					{ RETURN_IF_INVALID(parse_comment()); return SCALAR;}
!					{ RETURN_IF_INVALID(parse_comment()); return IMP_MARKER;}
.					{ RETURN_IF_INVALID(parse_comment());yylval.string = strdup(yytext); return TEXT; }
%%
