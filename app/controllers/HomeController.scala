package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import com.google.inject.Guice
import de.htwg.se.uno.Kek
import de.htwg.se.uno.aview.GUIP.displayCards
import de.htwg.se.uno.model.gameComponent.gameBaseImpl.Player
import scala.collection.mutable.ListBuffer

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val controller = new Kek().controller_return
  def home() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.home())
  }

  def about() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }
    

  def setup() = Action { implicit request: Request[AnyContent] => 
  
    Ok(views.html.displayGame.prestartState())
  }

  def create_game(name1: String, name2: String) = Action { implicit request: Request[AnyContent] =>
    controller.newG(name1, name2)
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(get_right_tuple(), controller.create_tuple()(0).length, controller.create_tuple()(2).length ,"", controller.game.pList(0).name, controller.game.pList(1).name, get_name_of_next_player()))
    } else {
      Ok(views.html.displayGame.playState(get_right_tuple(),"", controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
    }  
  }

  def next() = Action { implicit request: Request[AnyContent] => 
    controller.next()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(get_right_tuple(), controller.create_tuple()(0).length, controller.create_tuple()(2).length ,"", controller.game.pList(0).name, controller.game.pList(1).name, get_name_of_next_player()))
    } else {
      Ok(views.html.displayGame.playState(get_right_tuple(),"", controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
    }  
    }

  def place(ind: Int) = Action { implicit request: Request[AnyContent] => 
    controller.place(ind)
    var erro = ""
    if(controller.game.currentstate.toString() == "winState"){
      Ok(views.html.displayGame.winState(controller.game.pList(controller.game.winner).name))
    } else {
      if(controller.game.ERROR < 0) {
          erro = "Can not place this card, try another one or take a card"
          controller.game.setError(0)
     }
      if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
        Ok(views.html.displayGame.betweenState(get_right_tuple(), controller.create_tuple()(0).length, controller.create_tuple()(2).length ,erro, controller.game.pList(0).name, controller.game.pList(1).name, get_name_of_next_player()))
      } else {
        Ok(views.html.displayGame.playState(get_right_tuple(), erro, controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
      }  
    }
  }

  def take() = Action { implicit request: Request[AnyContent] => 
    controller.take()
    var erro = ""
    if(controller.game.ERROR < 0) {
        erro = "Can not take card in this state of the Game"
        controller.game.setError(0)
    }
    Ok(views.html.displayGame.playState(get_right_tuple(), erro, controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
  }

  def undo() = Action { implicit request: Request[AnyContent] => 
    controller.undo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(get_right_tuple(), controller.create_tuple()(0).length, controller.create_tuple()(2).length ,"", controller.game.pList(0).name, controller.game.pList(1).name, get_name_of_next_player()))
    } else {
      Ok(views.html.displayGame.playState(get_right_tuple(),"", controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
    }  
  }

  def redo() = Action { implicit request: Request[AnyContent] => 
    controller.redo()  
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      Ok(views.html.displayGame.betweenState(get_right_tuple(), controller.create_tuple()(0).length, controller.create_tuple()(2).length ,"", controller.game.pList(0).name, controller.game.pList(1).name, get_name_of_next_player()))
    } else {
      Ok(views.html.displayGame.playState(get_right_tuple(),"", controller.create_tuple()(0).length, controller.create_tuple()(2).length, controller.game.pList(0).name, controller.game.pList(1).name, get_card_count_of_next_player()))
    }   
  }

  def notFound() = Action { implicit request: Request[AnyContent] => 
    NotFound(views.html.notFound())
  }
  
  def badRequest(errorMessage: String) = Action {
    BadRequest(errorMessage + "\n")
  }

  def get_right_tuple(): List[List[(String, Int)]] = {
    var correct_player_tuple = List[List[(String, Int)]]()
    val tmp_tuple = controller.create_tuple()
    if(controller.game.currentstate.toString() == "between12State" || controller.game.currentstate.toString() == "between21State"){
      correct_player_tuple = List(tmp_tuple(1))
    } else {
      if(controller.game.currentstate.toString() == "player1State"){
        correct_player_tuple = List(tmp_tuple(1), tmp_tuple(0))
      } else {
        correct_player_tuple = List(tmp_tuple(1), tmp_tuple(2))
      }
    }   
    return correct_player_tuple
    }

  def get_name_of_next_player(): String = {
    var name = ""
      if(controller.game.currentstate.toString() == "between12State"){
          name = controller.game.pList(1).name
      } 
      else if(controller.game.currentstate.toString() == "between21State"){
          name = controller.game.pList(0).name
      }
      return name
    }

    def get_card_count_of_next_player(): Int = {
    var anz = 0
      if(controller.game.currentstate.toString() == "player1State"){
          anz = controller.game.pList(0).karten.length
      } 
      else if(controller.game.currentstate.toString() == "player2State"){
          anz = controller.game.pList(1).karten.length
      }
      return anz
    }
}
