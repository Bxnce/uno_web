package controllers

import de.htwg.se.uno.Kek
import de.htwg.se.uno.controller.controllerComponent.controllerInterface
import play.api.mvc._
import akka.actor._
import akka.stream.Materializer
import play.api.libs.streams.ActorFlow
import scala.swing.Reactor
import javax.inject._


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends BaseController {

  val controller: controllerInterface = new Kek().controller_return

//  import collection.mutable.{Map, ListBuffer}
//
//  type MyMapType = Map[String, ListBuffer[Object]]
//  var myMap: MyMapType = Map()

  var controller_map: Map[String, controllerInterface] = Map[String, controllerInterface]()

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

  def join(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.joinMultiplayer())
  }

  def createGame(name1: String, name2: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)

    Ok(views.html.displayGame.playState(true, controller.return_j))
  }

  def createGameMult(name1: String, name2: String, hash: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>

    if(hash == "") {
        controller_map = controller_map + (hash ->new Kek().controller_return)
    }else{
        controller_map(hash).newG(name1, name2)
    }

    Ok(views.html.displayGame.playState(true, controller.return_j))
  }

  def placeCard(ind: Int): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.place(ind)
    Ok(controller.return_j)
  }

  def placeCardMult(ind: Int, hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).place(ind)
    Ok(controller.return_j)
  }

  def retJson(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val json = controller.return_j
    Ok(json)
  }

  def retJsonMult(hash: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val json = controller_map(hash).return_j
    Ok(json)
  }

  def nextPlayer(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.next()
    Ok(controller.return_j)
  }

  def nextPlayerMult(hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).next()
    Ok(controller.return_j)
  }

  def takeCard(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller.take()
    Ok(controller.return_j)
  }

  def takeCardMult(hash:String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    controller_map(hash).take()
    Ok(controller.return_j)
  }

  def multWait(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.displayGame.waitMultiplayer())
  }

  def notFound(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    NotFound(views.html.notFound())
  }

  def badRequest(errorMessage: String): Action[AnyContent] = Action {
    BadRequest(errorMessage + "\n")
  }

  def socket: WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connection received")
      UNOWebSocketActorFactory.create(out)
    }
  }

  class UNOWebSocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo()
    def receive: Receive = {
      case msg: String =>
        println("hs: " + msg)
        out ! controller.return_j
    }
  }

  object UNOWebSocketActorFactory {
    def create(out: ActorRef): Props = {
      Props(new UNOWebSocketActor(out))
    }
  }
}
