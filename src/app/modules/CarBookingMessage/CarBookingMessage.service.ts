import { Request } from "express";
import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../utils/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import emailSender from "../../../helpars/emailSender";

const sendCarBookingEmail = async (findCar: any, req: Request) => {
  // Date formatting function
  // const formatItalianDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("it-IT", {
  //     weekday: "short",
  //     day: "numeric",
  //     month: "short",
  //     year: "numeric",
  //   });
  // };

  const formatItalianDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const generateRecieveCarBookingEmail = () => {
    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma richiesta di noleggio</title>
  <style type="text/css" emogrify="no">
    #outlook a { padding:0; } 
    .ExternalClass { width:100%; } 
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; } 
    table td { border-collapse: collapse; mso-line-height-rule: exactly; } 
    .editable.image { font-size: 0 !important; line-height: 0 !important; } 
    .nl2go_preheader { display: none !important; mso-hide:all !important; mso-line-height-rule: exactly; visibility: hidden !important; line-height: 0px !important; font-size: 0px !important; } 
    body { width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; } 
    img { outline:none; text-decoration:none; -ms-interpolation-mode: bicubic; } 
    a img { border:none; } 
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; } 
    th { font-weight: normal; text-align: left; } 
    *[class="gmail-fix"] { display: none !important; } 
  </style>
  <style type="text/css" emogrify="no"> 
    @media (max-width: 600px) { 
      .gmx-killpill { content: ' \x03D1';} 
    } 
  </style>
  <style type="text/css" emogrify="no">
    @media (max-width: 600px) { 
      .gmx-killpill { content: ' \x03D1';} 
      .r0-o { border-style: solid !important; margin: 0 auto 0 auto !important; width: 320px !important } 
      .r1-i { background-color: #ffffff !important } 
      .r2-c { box-sizing: border-box !important; text-align: center !important; valign: top !important; width: 100% !important } 
      .r3-o { border-style: solid !important; margin: 0 auto 0 auto !important; width: 100% !important } 
      .r4-i { background-color: #ffffff !important; padding-bottom: 20px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 20px !important } 
      .r5-c { box-sizing: border-box !important; display: block !important; valign: top !important; width: 100% !important } 
      .r6-o { border-style: solid !important; width: 100% !important } 
      .r7-i { padding-left: 0px !important; padding-right: 0px !important } 
      .r8-o { background-size: auto !important; border-style: solid !important; margin: 0 auto 0 auto !important; width: 37% !important } 
      .r9-i { padding-bottom: 15px !important; padding-top: 15px !important } 
      .r10-i { background-color: #ffffff !important; padding-bottom: 40px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 20px !important } 
      .r11-i { background-color: #f7f7f7 !important; padding-left: 0px !important; padding-right: 0px !important } 
      .r12-c { box-sizing: border-box !important; padding-bottom: 0px !important; padding-top: 20px !important; text-align: center !important; valign: top !important; width: 100% !important } 
      .r13-c { box-sizing: border-box !important; text-align: left !important; valign: top !important; width: 100% !important } 
      .r14-o { border-style: solid !important; margin: 0 auto 0 0 !important; width: 100% !important } 
      .r15-i { padding-bottom: 0px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 0px !important; text-align: center !important } 
      .r16-o { border-style: solid !important; margin: 0 auto 0 auto !important; margin-bottom: 0px !important; margin-top: 0px !important; width: 37% !important } 
      .r17-i { text-align: center !important } 
      .r18-r { background-color: #c10000 !important; border-radius: 17px !important; border-width: 1px !important; box-sizing: border-box; height: initial !important; padding-bottom: 8px !important; padding-top: 8px !important; text-align: center !important; width: 100% !important } 
      .r19-i { padding-bottom: 20px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 20px !important } 
      .r20-c { box-sizing: border-box !important; color: #3b3f44 !important; padding-bottom: 20px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 20px !important; text-align: center !important; width: 100% !important } 
      .r21-o { border-bottom-color: #000000 !important; border-bottom-width: 1px !important; border-left-color: #000000 !important; border-left-width: 1px !important; border-right-color: #000000 !important; border-right-width: 1px !important; border-style: solid !important; border-top-color: #000000 !important; border-top-width: 1px !important; margin: 0 auto 0 0 !important; width: 100% !important } 
      .r22-i { background-color: #f8f8f8 !important; padding-bottom: 18px !important; padding-left: 18px !important; padding-right: 5px !important; padding-top: 15px !important; text-align: left !important } 
      .r23-c { box-sizing: border-box !important; padding-bottom: 30px !important; padding-top: 30px !important; text-align: center !important; width: 100% !important } 
      .r24-c { box-sizing: border-box !important; text-align: center !important; width: 100% !important } 
      .r25-o { border-style: solid !important; margin: 0 auto 0 auto !important; width: 91% !important } 
      .r26-i { font-size: 0px !important; padding-bottom: 15px !important; padding-left: 71px !important; padding-right: 72px !important; padding-top: 15px !important } 
      .r27-c { box-sizing: border-box !important; width: 32px !important } 
      .r28-o { border-style: solid !important; margin-right: 8px !important; width: 32px !important } 
      .r29-i { padding-bottom: 5px !important; padding-top: 5px !important } 
      .r30-o { border-style: solid !important; margin-right: 0px !important; width: 32px !important } 
      .r31-i { padding-bottom: 20px !important; padding-left: 15px !important; padding-right: 15px !important; padding-top: 80px !important } 
      .r32-i { padding-bottom: 10px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 0px !important; text-align: center !important } 
      .r33-i { padding-bottom: 0px !important; padding-left: 0px !important; padding-right: 0px !important; padding-top: 10px !important; text-align: center !important } 
      body { -webkit-text-size-adjust: none } 
      .nl2go-responsive-hide { display: none } 
      .nl2go-body-table { min-width: unset !important } 
      .mobshow { height: auto !important; overflow: visible !important; max-height: unset !important; visibility: visible !important } 
      .resp-table { display: inline-table !important } 
      .magic-resp { display: table-cell !important } 
    } 
  </style>
  <!--[if !mso]><!-->
  <style type="text/css" emogrify="no">
    @import url("https://fonts.googleapis.com/css2?family=Roboto"); 
  </style>
  <!--<![endif]-->
  <style type="text/css">
    p, h1, h2, h3, h4, ol, ul, li { margin: 0; } 
    .nl2go-default-textstyle { color: #414141; font-family: Roboto, Arial; font-size: 16px; line-height: 1.5; word-break: break-word } 
    .default-button { color: #ffffff; font-family: Arial; font-size: 16px; font-style: normal; font-weight: normal; line-height: 1.15; text-decoration: none; word-break: break-word } 
    a, a:link { color: #d1252b; text-decoration: underline } 
    .default-heading1 { color: #414141; font-family: Arial; font-size: 36px; word-break: break-word } 
    .default-heading2 { color: #414141; font-family: Arial; font-size: 32px; word-break: break-word } 
    .default-heading3 { color: #1F2D3D; font-family: Arial; font-size: 24px; word-break: break-word } 
    .default-heading4 { color: #1F2D3D; font-family: Arial; font-size: 18px; word-break: break-word } 
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } 
    .no-show-for-you { border: none; display: none; float: none; font-size: 0; height: 0; line-height: 0; max-height: 0; mso-hide: all; overflow: hidden; table-layout: fixed; visibility: hidden; width: 0; } 
  </style>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <style type="text/css">
    a:link{color: #d1252b; text-decoration: underline;}
  </style>
</head>
<body bgcolor="#ffffff" text="#414141" link="#d1252b" yahoo="fix" style="background-color: #ffffff;">
  <table cellspacing="0" cellpadding="0" border="0" role="presentation" class="nl2go-body-table" width="100%" style="background-color: #ffffff; width: 100%;">
    <tr>
      <td>
        <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="600" align="center" class="r0-o" style="table-layout: fixed; width: 600px;">
          <tr>
            <td valign="top" class="r1-i" style="background-color: #ffffff;">
              <!-- Header Logo -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r4-i" style="background-color: #ffffff; padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r2-c" align="center">
                                      <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="131" class="r8-o" style="table-layout: fixed; width: 131px;">
                                        <tr>
                                          <td class="r9-i" style="font-size: 0px; line-height: 0px; padding-bottom: 15px; padding-top: 15px;">
                                            <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1767b6d28d744d3e833e8.png" width="131" border="0" style="display: block; width: 100%;">
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Hero Image -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r10-i" style="background-color: #ffffff; padding-bottom: 40px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="background-color: #f7f7f7; font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r11-i" style="background-color: #f7f7f7; padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r12-c" align="center" style="border-radius: 8px; font-size: 0px; line-height: 0px; padding-top: 20px; valign: top;">
                                      <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1895b6fdd629320b1d778.png" width="570" border="0" style="display: block; width: 100%; border-radius: 8px;">
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Intro Text -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r4-i" style="background-color: #ffffff; padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r13-c" align="left">
                                      <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r14-o" style="table-layout: fixed; width: 100%;">
                                        <tr>
                                          <td align="center" valign="top" class="r15-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; text-align: center;">
                                            <div>
                                              <p style="margin: 0;"><span style="font-family: 'Arial black', helvetica, sans-serif, Arial; font-size: 13px;"><strong>Grazie per la tua richiesta!</strong></span></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Abbiamo ricevuto la tua richiesta di noleggio.</span></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Il proprietario del veicolo ti contatterà al più presto per confermare la disponibilità.</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">​</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Cordiali saluti,​</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Il team di Bittengo</span></p>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r4-i" style="background-color: #ffffff; padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r2-c" align="center">
                                      <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="148" class="r16-o" style="table-layout: fixed; width: 148px;">
                                        <tr>
                                          <td height="17" align="center" valign="top" class="r17-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word;">
                                            <!--[if mso]>
                                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://bittengo.org" style="v-text-anchor:middle; height: 42px; width: 147px;" arcsize="40%" fillcolor="#c10000" strokecolor="#c10000" strokeweight="1px" data-btn="1">
                                              <w:anchorlock></w:anchorlock>
                                              <v:textbox inset="0,0,0,0">
                                                <div style="display:none;">
                                                  <center class="default-button"><span><span style="font-size:14px;">Sito web&nbsp;</span></span></center>
                                                </div>
                                              </v:textbox>
                                            </v:roundrect>
                                            <![endif]-->
                                            <!--[if !mso]><!-- -->
                                            <a href="https://bittengo.org" class="r18-r default-button" target="_blank" title="Conferma ora" data-btn="1" style="font-style: normal; font-weight: normal; line-height: 1.15; text-decoration: none; word-break: break-word; border-style: solid; word-wrap: break-word; display: block; -webkit-text-size-adjust: none; background-color: #c10000; border-color: #c10000; border-radius: 17px; border-width: 1px; color: #ffffff; font-family: Arial; font-size: 16px; height: 17px; mso-hide: all; padding-bottom: 12px; padding-top: 12px; width: 146px;">
                                              <span><span style="font-size: 14px;">Sito web&nbsp;</span></span>
                                            </a>
                                            <!--<![endif]-->
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r19-i" style="padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r20-c" align="center" style="color: #3b3f44; padding-bottom: 20px; padding-top: 20px;">
                                      <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" height="2" style="border-top-style: solid; background-clip: border-box; border-top-color: #aaaaaa; border-top-width: 2px; font-size: 2px; line-height: 2px;">
                                        <tr>
                                          <td height="0" style="font-size: 0px; line-height: 0px;">&shy;</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Details -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r19-i" style="padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r13-c" align="left">
                                      <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r21-o" style="background-color: #f8f8f8; border-bottom-color: #000000; border-bottom-width: 1px; border-collapse: separate; border-left-color: #000000; border-left-width: 1px; border-radius: 11px; border-right-color: #000000; border-right-width: 1px; border-style: solid; border-top-color: #000000; border-top-width: 1px; table-layout: fixed; width: 100%;">
                                        <tr>
                                          <td align="left" valign="top" class="r22-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; background-color: #f8f8f8; border-radius: 10px; padding-bottom: 18px; padding-left: 18px; padding-right: 5px; padding-top: 15px; text-align: left;">
                                            <div>
                                              <p style="margin: 0;"><span style="font-family: 'Arial black', helvetica, sans-serif, Arial; font-size: 13px;"><strong>Riepilogo prenotazione</strong></span></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Veicolo:</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">${
                                                findCar.brand
                                              } ${findCar.model} (${
      findCar.year
    })</span></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Proprietario:</span></p>
                                              <p style="margin: 0;"><a href="mailto:${
                                                findCar.email
                                              }" style="color: #d1252b; text-decoration: underline;"><span style="font-size: 13px;">${
      findCar.email
    }</span></a></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Check-in:</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">${formatItalianDate(
                                                req.body.checkInDate
                                              )} alle ore ${
      req.body.checkInTime
    }</span></p>
                                              <p style="margin: 0;">&nbsp;</p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">Check-out:</span></p>
                                              <p style="margin: 0;"><span style="font-size: 13px;">${formatItalianDate(
                                                req.body.checkOutDate
                                              )} alle ore ${
      req.body.checkOutTime
    }</span></p>
                                              ${
                                                req.body.message
                                                  ? `
                                                <p style="margin: 0;">&nbsp;</p>
                                                <p style="margin: 0;"><span style="font-size: 13px;">Il tuo messaggio:</span></p>
                                                <p style="margin: 0;"><span style="font-size: 13px;">${req.body.message}</span></p>
                                              `
                                                  : ""
                                              }
                                              ${
                                                req.body.specialRequest
                                                  ? `
                                                <p style="margin: 0;">&nbsp;</p>
                                                <p style="margin: 0;"><span style="font-size: 13px; color: #BF360C;">La tua richiesta speciale:</span></p>
                                                <p style="margin: 0;"><span style="font-size: 13px; color: #BF360C;">${req.body.specialRequest}</span></p>
                                              `
                                                  : ""
                                              }
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Pricing Section -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r19-i" style="padding-bottom: 20px; padding-top: 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <th width="100%" valign="top" class="r5-c" style="font-weight: normal;">
                          <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;">
                            <tr>
                              <td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;">
                                <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                                  <tr>
                                    <td class="r13-c" align="left">
                                      <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r21-o" style="background-color: #f8f8f8; border-bottom-color: #000000; border-bottom-width: 1px; border-collapse: separate; border-left-color: #000000; border-left-width: 1px; border-radius: 11px; border-right-color: #000000; border-right-width: 1px; border-style: solid; border-top-color: #000000; border-top-width: 1px; table-layout: fixed; width: 100%;">
                                        <tr>
                                          <td align="left" valign="top" class="r22-i nl2go-default-textstyle" style="color: #414141; font-family: Roboto,Arial; font-size: 16px; line-height: 1.5; word-break: break-word; background-color: #f8f8f8; border-radius: 10px; padding-bottom: 18px; padding-left: 18px; padding-right: 5px; padding-top: 15px; text-align: left;">
                                            <div>
                                              <p style="margin: 0;"><span style="font-family: 'Arial black', helvetica, sans-serif, Arial; font-size: 13px;"><strong>Tariffe applicate</strong></span></p>
                                              ${findCar.price
                                                .map(
                                                  (p: any) => `
                                                <p style="margin: 0; padding-top: 5px;"><span style="font-size: 13px;">
                                                  ${p.rentalTime}h: CHF ${
                                                    p.price
                                                  }
                                                  ${
                                                    p.kilometerPerHour
                                                      ?(p.kilometerPerHour === "Unlimited") ? "(illimitati km)" : `(${p.kilometerPerHour} km)`
                                                      : ""
                                                  }
                                                </span></p>
                                              `
                                                )
                                                .join("")}
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </th>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" align="center" class="r3-o" style="table-layout: fixed; width: 100%;">
                <tr>
                  <td class="r23-c" style="padding-bottom: 30px; padding-top: 30px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" height="3" style="border-top-style: solid; background-clip: border-box; border-top-color: #4A4A4A; border-top-width: 3px; font-size: 3px; line-height: 3px;">
                      <tr>
                        <td height="0" style="font-size: 0px; line-height: 0px;">&shy;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Social Links -->
          <!-- Social Links -->
          <div class="text-center py-4">
            <div class="inline-flex gap-4" style="display: inline-flex; gap: 1rem;">
              <a href="https://www.instagram.com/bittengo_official?igsh=MW5tMnExb2FsOGxuaw%3D%3D&utm_source=qr" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/instagram_32px.png" width="32" style="display: block; width: 32px;">
              </a>
              <a href="https://bittengo-frontend.vercel.app" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/website_32px.png" width="32" style="display: block; width: 32px;">
              </a>
              <a href="https://www.facebook.com/share/15yFdw4ATZ/?mibextid=wwXIfr" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/facebook_32px.png" width="32" style="display: block; width: 32px;">
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="pt-20 pb-5" style="padding-top: 5rem; padding-bottom: 1.25rem;">
            <div class="text-center">
              <p class="text-black text-sm font-bold" style="color: #000000; font-size: 0.875rem; font-weight: bold;">BITTENGO</p>
              <p class="text-gray-600 text-sm" style="color: #666666; font-size: 0.875rem;">Via massagno 17, 6900, Massagno</p>
              <p class="text-gray-600 text-sm pt-2" style="color: #666666; font-size: 0.875rem; padding-top: 0.5rem;">
                ${new Date().toLocaleDateString("it-IT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p class="text-gray-600 text-sm" style="color: #666666; font-size: 0.875rem;">
                Bittengo SAGL · bittengo@gmail.com · +41 78 248 05 01
              </p>
              <p class="text-gray-600 text-sm pt-2" style="color: #666666; font-size: 0.875rem; padding-top: 0.5rem;">
                <a href="{{ unsubscribe }}" class="underline text-gray-600" target="_blank" style="color: #666666; text-decoration: underline;">
                  Annulla iscrizione
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateEmailHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuova richiesta di noleggio</title>
        <style type="text/css">
          #outlook a { padding:0; }
          .ExternalClass { width:100%; }
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
          body { width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; }
          img { outline:none; text-decoration:none; -ms-interpolation-mode: bicubic; }
          a img { border:none; }
          table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
          th { font-weight: normal; text-align: left; }
          *[class="gmail-fix"] { display: none !important; }
          .max-w-600 { max-width: 600px; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .bg-white { background-color: #ffffff; }
          .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .text-sm { font-size: 0.875rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .bg-gray-100 { background-color: #f7f7f7; }
          .rounded-lg { border-radius: 0.5rem; }
          .w-full { width: 100%; }
          .inline-block { display: inline-block; }
          .bg-red-600 { background-color: #c10000; }
          .text-white { color: #ffffff; }
          .rounded-full { border-radius: 9999px; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .no-underline { text-decoration: none; }
          .border-t-2 { border-top-width: 2px; }
          .border-gray-300 { border-color: #aaaaaa; }
          .border { border-width: 1px; }
          .border-black { border-color: #000000; }
          .rounded-xl { border-radius: 0.75rem; }
          .p-4 { padding: 1rem; }
          .text-left { text-align: left; }
          .border-t-3 { border-top-width: 3px; }
          .border-gray-700 { border-color: #4A4A4A; }
          .inline-flex { display: inline-flex; }
          .gap-4 { gap: 1rem; }
          .pt-20 { padding-top: 5rem; }
          .pb-5 { padding-bottom: 1.25rem; }
          .text-black { color: #000000; }
          .text-gray-600 { color: #666666; }
          .pt-2 { padding-top: 0.5rem; }
          .underline { text-decoration: underline; }
          .text-orange-600 { color: #FF7600; }
          .text-red-600 { color: #d1252b; }
          .font-arial-black { font-family: 'Arial black', helvetica, sans-serif; }
        </style>
      </head>
      <body class="bg-white">
        <div class="max-w-600 mx-auto">
          <!-- Header -->
          <div class="bg-white py-5">
            <div class="text-center">
              <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1767b6d28d744d3e833e8.png" width="131" style="display: block; margin-left: auto; margin-right: auto;">
            </div>
          </div>
          
          <!-- Hero Image -->
          <div class="bg-white py-5">
            <div class="bg-gray-100 rounded-lg">
              <img src="https://img.mailinblue.com/7962968/images/content_library/original/67e1895b6fdd629320b1d778.png" class="w-full rounded-lg" style="width: 100%; border-radius: 0.5rem;">
            </div>
          </div>
          
          <!-- Intro Text -->
          <div class="bg-white py-5 text-center">
            <p class="font-bold font-arial-black text-sm" style="font-weight: bold; font-family: 'Arial black', helvetica, sans-serif; font-size: 0.875rem;">
              <strong>Hai una richiesta!</strong>
            </p>
            <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
            <p class="text-sm" style="font-size: 0.875rem;">Hai ricevuto una richiesta di noleggio per il tuo ${
              findCar.brand
            } ${findCar.model}.</p>
            <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
            <p class="text-sm" style="font-size: 0.875rem;">Qui in seguito troverai tutte le informazioni necessarie per metterti in contatto con il tuo cliente.</p>
            <p class="text-sm" style="font-size: 0.875rem;">​</p>
            <p class="text-sm" style="font-size: 0.875rem;">Cordiali saluti,​</p>
            <p class="text-sm" style="font-size: 0.875rem;">Il team di Bittengo</p>
          </div>
          
          <!-- Button -->
          <div class="bg-white py-5 text-center">
            <a href="https://bittengo.org" class="inline-block bg-red-600 text-white rounded-full px-6 py-2 text-sm no-underline" style="display: inline-block; background-color: #c10000; color: #ffffff; border-radius: 9999px; padding-left: 1.5rem; padding-right: 1.5rem; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 0.875rem; text-decoration: none;">
              Sito web
            </a>
          </div>
          
          <!-- Divider -->
          <div class="py-5">
            <hr class="border-t-2 border-gray-300" style="border-top: 2px solid #aaaaaa;">
          </div>
          
          <!-- Booking Details -->
          <div class="py-5">
            <div class="bg-gray-100 border border-black rounded-xl p-4 text-left" style="background-color: #f7f7f7; border: 1px solid #000000; border-radius: 0.75rem; padding: 1rem; text-align: left;">
              <p class="font-bold font-arial-black text-sm" style="font-weight: bold; font-family: 'Arial black', helvetica, sans-serif; font-size: 0.875rem;">
                <strong>Dati di prenotazione</strong>
              </p>
              <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
              <p class="text-sm" style="font-size: 0.875rem;">Veicolo:</p>
              <p class="text-sm" style="font-size: 0.875rem;">${
                findCar.brand
              } ${findCar.model} (${findCar.year})</p>
              <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
              <p class="text-sm" style="font-size: 0.875rem;">Email noleggiatore:</p>
              <p class="text-sm" style="font-size: 0.875rem;"><a href="mailto:${
                req.body.email
              }" class="text-orange-600" style="color: #FF7600;">${
      req.body.email
    }</a></p>
              <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
              <p class="text-sm" style="font-size: 0.875rem;">Check-in:</p>
              <p class="text-sm" style="font-size: 0.875rem;">${formatItalianDate(
                req.body.checkInDate
              )} alle ore ${req.body.checkInTime}</p>
              <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
              <p class="text-sm" style="font-size: 0.875rem;">Check-out:</p>
              <p class="text-sm" style="font-size: 0.875rem;">${formatItalianDate(
                req.body.checkOutDate
              )} alle ore ${req.body.checkOutTime}</p>
              <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
              <p class="text-sm" style="font-size: 0.875rem;">Numero di telefono:</p>
              <p class="text-sm" style="font-size: 0.875rem;">${
                req.body.phoneNumber || "Non fornito"
              }</p>
              ${
                req.body.message
                  ? `
                <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
                <p class="text-sm" style="font-size: 0.875rem;">Messaggio:</p>
                <p class="text-sm" style="font-size: 0.875rem;">${req.body.message}</p>
              `
                  : ""
              }
              ${
                req.body.specialRequest
                  ? `
                <p class="py-1" style="padding-top: 0.25rem; padding-bottom: 0.25rem;"></p>
                <p class="text-sm" style="font-size: 0.875rem; color: #BF360C;">Richiesta speciale:</p>
                <p class="text-sm" style="font-size: 0.875rem; color: #BF360C;">${req.body.specialRequest}</p>
              `
                  : ""
              }
            </div>
          </div>
          
          <!-- Pricing Section -->
          <div class="py-5">
            <div class="bg-gray-100 border border-black rounded-xl p-4 text-left" style="background-color: #f7f7f7; border: 1px solid #000000; border-radius: 0.75rem; padding: 1rem; text-align: left;">
              <p class="font-bold font-arial-black text-sm" style="font-weight: bold; font-family: 'Arial black', helvetica, sans-serif; font-size: 0.875rem;">
                <strong>Tariffe</strong>
              </p>
              ${findCar.price
                .map(
                  (p: any) => `
                <p class="text-sm" style="font-size: 0.875rem;">
                  ${p.rentalTime}h: CHF ${p.price}
                  ${p.kilometerPerHour ? (p.kilometerPerHour === "Unlimited") ? "(illimitati km)" : `(${p.kilometerPerHour} km)` : ""}
                </p>
              `
                )
                .join("")}
            </div>
          </div>
          
          <!-- Divider -->
          <div class="py-8">
            <hr class="border-t-3 border-gray-700" style="border-top: 3px solid #4A4A4A;">
          </div>
          
          <!-- Social Links -->
          <div class="text-center py-4">
            <div class="inline-flex gap-4" style="display: inline-flex; gap: 1rem;">
              <a href="https://www.instagram.com/bittengo_official?igsh=MW5tMnExb2FsOGxuaw%3D%3D&utm_source=qr" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/instagram_32px.png" width="32" style="display: block; width: 32px;">
              </a>
              <a href="https://bittengo-frontend.vercel.app" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/website_32px.png" width="32" style="display: block; width: 32px;">
              </a>
              <a href="https://www.facebook.com/share/15yFdw4ATZ/?mibextid=wwXIfr" target="_blank">
                <img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_bw/facebook_32px.png" width="32" style="display: block; width: 32px;">
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="pt-20 pb-5" style="padding-top: 5rem; padding-bottom: 1.25rem;">
            <div class="text-center">
              <p class="text-black text-sm font-bold" style="color: #000000; font-size: 0.875rem; font-weight: bold;">BITTENGO</p>
              <p class="text-gray-600 text-sm" style="color: #666666; font-size: 0.875rem;">Via massagno 17, 6900, Massagno</p>
              <p class="text-gray-600 text-sm pt-2" style="color: #666666; font-size: 0.875rem; padding-top: 0.5rem;">
                ${new Date().toLocaleDateString("it-IT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p class="text-gray-600 text-sm" style="color: #666666; font-size: 0.875rem;">
                Bittengo SAGL · bittengo@gmail.com · +41 78 248 05 01
              </p>
              <p class="text-gray-600 text-sm pt-2" style="color: #666666; font-size: 0.875rem; padding-top: 0.5rem;">
                <a href="{{ unsubscribe }}" class="underline text-gray-600" target="_blank" style="color: #666666; text-decoration: underline;">
                  Annulla iscrizione
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const mailOptions = {
    from: `"${req.body.email}" <${req.body.email}>`,
    to: findCar.email,
    subject: `Nuova richiesta di noleggio per la tua ${findCar.brand} ${findCar.model}`,
    html: generateEmailHtml(),
  };

  await emailSender(mailOptions.subject, mailOptions.to, mailOptions.html);
  await emailSender(
    "Nuova richiesta di noleggio",
    req.body.email,
    generateRecieveCarBookingEmail()
  );

  return "Booking email sent successfully";
};

const createCarBookingMessage = async (req: Request) => {
  const carId = req.body.carId;
  const findCar = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      owner: true,
    },
  });

  if (!findCar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Car not found");
  }

  const data = req.body;
  const result = await prisma.carBookingMessage.create({ data });

  try {
    // Send email to car owner (fire and forget)
    await sendCarBookingEmail(findCar, req);
  } catch (emailError) {
    console.error("Failed to send booking email:", emailError);
  }
  return result;
};

const getAllCarBookingMessages = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.carBookingMessage, query);
  const carbookingmessages = await queryBuilder
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields()
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: carbookingmessages };
};

const getSingleCarBookingMessage = async (id: string) => {
  const result = await prisma.carBookingMessage.findUnique({ where: { id } });
  return result;
};

const updateCarBookingMessage = async (id: string, data: any) => {
  const result = await prisma.carBookingMessage.update({ where: { id }, data });
  return result;
};

const deleteCarBookingMessage = async (id: string) => {
  const result = await prisma.carBookingMessage.delete({ where: { id } });
  return result;
};

export const carbookingmessageService = {
  createCarBookingMessage,
  getAllCarBookingMessages,
  getSingleCarBookingMessage,
  updateCarBookingMessage,
  deleteCarBookingMessage,
};
