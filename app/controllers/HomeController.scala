package controllers

import de.htwg.se.uno.Kek
import de.htwg.se.uno.controller.controllerComponent.controllerInterface
import play.api.mvc._
import akka.actor._
import akka.stream.Materializer
import play.api.libs.streams.ActorFlow
import javax.inject._
import collection.mutable.ListBuffer


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends BaseController {

  val controller: controllerInterface = new Kek().controller_return

  var controller_map: Map[String, controllerInterface] = Map[String, controllerInterface]()
  var hash_map: Map[String, String] = Map[String, String]()
  var client_map: Map[String, ListBuffer[ActorRef]] = Map[String, ListBuffer[ActorRef]]()

  def home(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home())
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def setup(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.prestartState())
  }

  def setup_multiplayer(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.prestartStateMultiplayer())
  }

  def getToJoin(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.joinMultiplayer())
  }

  def join(hash: String, name:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).newG(hash_map(hash), name)
    controller_map(hash).next()
    Ok(views.html.displayGame.playStateMult())
  }

  def createGame(name1: String, name2: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    Ok(controller.return_j)
  }

  def createController(hash: String, name:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map += (hash -> new Kek().controller_return)
    hash_map += (hash -> name)
    Ok("ok")
  }

  def placeCard(ind: Int): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(ind)
    Ok(controller.return_j)
  }

  def placeCardMult(ind: Int, hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).place(ind)
    val placed_card = controller_map(hash).game.midCard.karten(0).toString
    if (controller_map(hash).game.ERROR == 0) {
      if( placed_card == "GS" | placed_card == "RS" | placed_card == "YS" | placed_card == "BS"){
        controller_map(hash).next()
      }
      controller_map(hash).next()
    }
    Ok("success")
  }

  def chooseColor(color: String, hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).colorChoose(color)
    controller_map(hash).next()
    Ok("ok")
  }

  def retJson(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val json = controller.return_j
    Ok(json)
  }

  def nextPlayer(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.next()
    Ok(controller.return_j)
  }

  def nextPlayerMult(hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).next()
    controller_map(hash).next()
    Ok("success")
  }

  def takeCard(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.take()
    Ok(controller.return_j)
  }

  def takeCardMult(hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).take()
    Ok("success")
  }

  def notFound(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound())
  }

  def badRequest(errorMessage: String): Action[AnyContent] = Action {
    BadRequest(errorMessage + "\n")
  }

  def socket(hash:String): WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      UNOWebSocketActorFactory.create(out,hash)
    }
  }

  class UNOWebSocketActor(out: ActorRef, hash:String) extends Actor {
    if (client_map.contains(hash)) {
      var a = client_map(hash)
      a += out
      client_map += (hash -> a)
    } else {
      client_map += (hash -> ListBuffer(out))
    }
    def receive: Receive = {
      case "Keep alive" => out ! "Keep alive"
      case "refresh" => {
        for (client <- client_map(hash)) {
          client ! controller_map(hash).return_j
        }
      }
      case msg: String =>
        println("ws: " + msg + " for game: " + hash)
        out ! controller_map(hash).return_j
    }

  }

  object UNOWebSocketActorFactory {
    def create(out: ActorRef, hash: String): Props = {
      Props(new UNOWebSocketActor(out, hash))
    }
  }
}


